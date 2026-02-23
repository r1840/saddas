import Decimal from 'decimal.js';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import { hashPassword } from './password';

type DbLike = {
  query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
};

let db: DbLike | null = null;
let initialized = false;

async function initSchema(client: DbLike): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      auto_trading_enabled BOOLEAN DEFAULT FALSE,
      auto_trading_enabled_at TEXT,
      created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      cash TEXT DEFAULT '0.00',
      holdings JSON DEFAULT '{}',
      pump_gain_percent NUMERIC DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      coin_id TEXT NOT NULL,
      coin_name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount TEXT NOT NULL,
      price TEXT NOT NULL,
      total TEXT NOT NULL,
      timestamp TEXT DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS watchlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      coins JSON DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS pumps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      coin_id TEXT NOT NULL,
      percentage NUMERIC NOT NULL,
      duration_minutes INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      completed_percentage NUMERIC DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      initial_amount TEXT DEFAULT '0',
      current_gain_amount TEXT DEFAULT '0'
    );

    ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS pump_gain_percent NUMERIC DEFAULT 0;
  `);
}

async function getDb(): Promise<DbLike> {
  if (!db) {
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = {
        query: async (text: string, params?: any[]) => {
          const res = await pool.query(text, params);
          return { rows: res.rows as any[] };
        },
      };
    } else {
      const pglite = new PGlite('./.pglite');
      db = {
        query: async (text: string, params?: any[]) => {
          const res = await pglite.query(text, params);
          return { rows: (res.rows || []) as any[] };
        },
      };
    }
  }

  if (!initialized) {
    await initSchema(db);
    initialized = true;
  }

  return db;
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  isAdmin: boolean;
  createdAt: string;
  auto_trading_enabled?: boolean;
}

export interface Portfolio {
  id?: string;
  userId: string;
  cash: string;
  holdings: Record<string, { amount: string; averagePrice: string }>;
  pumpGainPercent?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  coinId: string;
  coinName: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  amount: string;
  price: string;
  total: string;
  timestamp: string;
}

export interface Pump {
  id: string;
  userId: string;
  coinId: string;
  percentage: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  completedPercentage: number;
  isActive: boolean;
  initialAmount: string;
  currentGainAmount: string;
}

export interface Watchlist {
  userId: string;
  coins: string[];
}

function toUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    auto_trading_enabled: row.auto_trading_enabled || false,
  };
}

function toPortfolio(row: any): Portfolio {
  return {
    id: row.id,
    userId: row.user_id,
    cash: row.cash,
    holdings: typeof row.holdings === 'string' ? JSON.parse(row.holdings || '{}') : (row.holdings || {}),
    pumpGainPercent: Number(row.pump_gain_percent || 0),
  };
}

export async function createUser(username: string, email: string, password: string): Promise<User> {
  const db = await getDb();

  const existingUsername = await db.query('SELECT id FROM users WHERE username = $1 LIMIT 1', [username]);
  if (existingUsername.rows.length) throw new Error('Username already taken');

  const existingEmail = await db.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
  if (existingEmail.rows.length) throw new Error('Email already registered');

  const countRes = await db.query('SELECT COUNT(*)::int AS count FROM users');
  const isFirstUser = Number((countRes.rows[0] as any).count) === 0;

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  const insertUser = await db.query(
    `INSERT INTO users (id, username, email, password, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, username, email, passwordHash, isFirstUser]
  );

  const user = toUser(insertUser.rows[0]);

  await db.query('INSERT INTO portfolios (id, user_id, cash, holdings, pump_gain_percent) VALUES ($1, $2, $3, $4::json, $5)', [
    crypto.randomUUID(),
    user.id,
    '0.00',
    JSON.stringify({}),
    0,
  ]);

  await db.query('INSERT INTO watchlists (id, user_id, coins) VALUES ($1, $2, $3::json)', [crypto.randomUUID(), user.id, JSON.stringify([])]);

  return user;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
  if (!res.rows.length) return null;
  return toUser(res.rows[0]);
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  if (!res.rows.length) return null;
  return toUser(res.rows[0]);
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM users ORDER BY created_at DESC');
  return res.rows.map(toUser);
}

export async function deleteUser(userId: string): Promise<void> {
  const db = await getDb();
  await db.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM pumps WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM watchlists WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM portfolios WHERE user_id = $1', [userId]);
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}

export async function getPortfolio(userId: string): Promise<Portfolio | null> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM portfolios WHERE user_id = $1 LIMIT 1', [userId]);
  if (!res.rows.length) return null;
  return toPortfolio(res.rows[0]);
}

export async function updatePortfolio(portfolio: Portfolio): Promise<void> {
  const db = await getDb();
  await db.query(
    `UPDATE portfolios
     SET cash = $1,
         holdings = $2::json,
         pump_gain_percent = $3
     WHERE user_id = $4`,
    [portfolio.cash, JSON.stringify(portfolio.holdings || {}), portfolio.pumpGainPercent || 0, portfolio.userId]
  );
}

export async function updateUserBalance(userId: string, newBalance: string, resetPumpGain = false): Promise<void> {
  const db = await getDb();
  if (resetPumpGain) {
    await db.query('UPDATE portfolios SET cash = $1, pump_gain_percent = 0 WHERE user_id = $2', [newBalance, userId]);
    return;
  }
  await db.query('UPDATE portfolios SET cash = $1 WHERE user_id = $2', [newBalance, userId]);
}

const SYMBOL_TO_COIN_ID: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  bnb: 'binancecoin',
  xrp: 'ripple',
  ada: 'cardano',
  doge: 'dogecoin',
};

export async function addUserAsset(userId: string, assetType: string, amount: number): Promise<void> {
  const portfolio = await getPortfolio(userId);
  if (!portfolio) throw new Error('Portfolio not found');

  if (assetType === 'cash') {
    const currentCash = new Decimal(portfolio.cash);
    const newCash = currentCash.plus(new Decimal(amount)).toFixed(8);
    await updateUserBalance(userId, newCash, true);
    return;
  }

  const coinId = SYMBOL_TO_COIN_ID[assetType] || assetType;
  const holdings = portfolio.holdings || {};
  const currentAmount = holdings[coinId] ? new Decimal(holdings[coinId].amount) : new Decimal(0);
  const newAmount = currentAmount.plus(new Decimal(amount)).toFixed(8);

  holdings[coinId] = {
    amount: newAmount,
    averagePrice: holdings[coinId]?.averagePrice || '0',
  };

  await updatePortfolio({ ...portfolio, holdings, pumpGainPercent: 0 });
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const res = await db.query(
    `INSERT INTO transactions (id, user_id, coin_id, coin_name, type, amount, price, total, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      id,
      transaction.userId,
      transaction.coinId,
      transaction.coinName,
      transaction.type,
      transaction.amount,
      transaction.price,
      transaction.total,
      transaction.timestamp,
    ]
  );

  const row = res.rows[0] as any;
  return {
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    coinName: row.coin_name,
    type: row.type,
    amount: row.amount,
    price: row.price,
    total: row.total,
    timestamp: row.timestamp,
  };
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC', [userId]);
  return res.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    coinName: row.coin_name,
    type: row.type,
    amount: row.amount,
    price: row.price,
    total: row.total,
    timestamp: row.timestamp,
  }));
}

export async function getWatchlist(userId: string): Promise<Watchlist | null> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM watchlists WHERE user_id = $1 LIMIT 1', [userId]);
  if (!res.rows.length) return null;

  return {
    userId: (res.rows[0] as any).user_id,
    coins: typeof (res.rows[0] as any).coins === 'string' ? JSON.parse((res.rows[0] as any).coins || '[]') : ((res.rows[0] as any).coins || []),
  };
}

export async function updateWatchlist(watchlist: Watchlist): Promise<void> {
  const db = await getDb();
  await db.query('UPDATE watchlists SET coins = $1::json WHERE user_id = $2', [JSON.stringify(watchlist.coins), watchlist.userId]);
}

export async function createPump(userId: string, coinId: string, percentage: number, durationMinutes: number): Promise<Pump> {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const portfolio = await getPortfolio(userId);
  const initialAmount = portfolio?.holdings[coinId]?.amount || '0';

  const db = await getDb();
  const id = crypto.randomUUID();
  const res = await db.query(
    `INSERT INTO pumps
      (id, user_id, coin_id, percentage, duration_minutes, start_time, end_time, completed_percentage, is_active, initial_amount, current_gain_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 0, true, $8, '0')
     RETURNING *`,
    [id, userId, coinId, percentage, durationMinutes, startTime.toISOString(), endTime.toISOString(), initialAmount]
  );

  const row = res.rows[0] as any;
  return {
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    percentage: Number(row.percentage),
    durationMinutes: row.duration_minutes,
    startTime: row.start_time,
    endTime: row.end_time,
    completedPercentage: Number(row.completed_percentage),
    isActive: row.is_active,
    initialAmount: row.initial_amount,
    currentGainAmount: row.current_gain_amount,
  };
}

export async function getActivePumps(userId: string): Promise<Pump[]> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM pumps WHERE user_id = $1 AND is_active = true', [userId]);
  return res.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    percentage: Number(row.percentage),
    durationMinutes: row.duration_minutes,
    startTime: row.start_time,
    endTime: row.end_time,
    completedPercentage: Number(row.completed_percentage),
    isActive: row.is_active,
    initialAmount: row.initial_amount,
    currentGainAmount: row.current_gain_amount,
  }));
}

export async function updatePump(pump: Pump): Promise<void> {
  const db = await getDb();
  await db.query(
    `UPDATE pumps
     SET completed_percentage = $1,
         is_active = $2,
         current_gain_amount = $3
     WHERE id = $4`,
    [pump.completedPercentage, pump.isActive, pump.currentGainAmount, pump.id]
  );
}

export async function getAllActivePumps(): Promise<Pump[]> {
  const db = await getDb();
  const res = await db.query('SELECT * FROM pumps WHERE is_active = true');
  return res.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    coinId: row.coin_id,
    percentage: Number(row.percentage),
    durationMinutes: row.duration_minutes,
    startTime: row.start_time,
    endTime: row.end_time,
    completedPercentage: Number(row.completed_percentage),
    isActive: row.is_active,
    initialAmount: row.initial_amount,
    currentGainAmount: row.current_gain_amount,
  }));
}

export async function addPumpGainPercent(userId: string, additionalPercent: number): Promise<void> {
  const db = await getDb();
  await db.query(
    'UPDATE portfolios SET pump_gain_percent = COALESCE(pump_gain_percent, 0) + $1 WHERE user_id = $2',
    [additionalPercent, userId]
  );
}

export async function setAiTradingEnabled(userId: string, enabled: boolean): Promise<void> {
  const db = await getDb();
  await db.query(
    `UPDATE users
     SET auto_trading_enabled = $1,
         auto_trading_enabled_at = $2
     WHERE id = $3`,
    [enabled, enabled ? new Date().toISOString() : null, userId]
  );
}

export async function getAiTradingEnabled(userId: string): Promise<boolean> {
  const db = await getDb();
  const res = await db.query('SELECT auto_trading_enabled FROM users WHERE id = $1 LIMIT 1', [userId]);
  if (!res.rows.length) return false;
  return (res.rows[0] as any).auto_trading_enabled === true;
}
