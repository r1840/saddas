BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  auto_trading_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  auto_trading_enabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  cash NUMERIC(38, 8) NOT NULL DEFAULT 0,
  holdings JSONB NOT NULL DEFAULT '{}'::jsonb,
  pump_gain_percent NUMERIC(20, 8) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy','sell','deposit','withdraw')),
  amount NUMERIC(38, 18) NOT NULL,
  price NUMERIC(38, 18) NOT NULL,
  total NUMERIC(38, 18) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  coins JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS pumps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  percentage NUMERIC(20, 8) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  completed_percentage NUMERIC(20, 8) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  initial_amount NUMERIC(38, 18) NOT NULL DEFAULT 0,
  current_gain_amount NUMERIC(38, 18) NOT NULL DEFAULT 0
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_trading_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_trading_enabled_at TIMESTAMPTZ;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS pump_gain_percent NUMERIC(20, 8) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_time ON transactions(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pumps_user_active ON pumps(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pumps_active_end_time ON pumps(is_active, end_time);

COMMIT;
