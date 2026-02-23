-- =====================================================
-- CryptoVest - Complete Database Setup
-- =====================================================
-- Run this ONCE in your new Supabase project:
--   Supabase Dashboard > SQL Editor > paste > Run
-- =====================================================


-- =====================================================
-- DROP existing tables (if starting fresh)
-- Remove these lines if you want to keep existing data
-- =====================================================
DROP TABLE IF EXISTS public.watchlists CASCADE;
DROP TABLE IF EXISTS public.pumps CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.portfolios CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;


-- =====================================================
-- 1. USERS
-- =====================================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  is_admin      BOOLEAN DEFAULT FALSE,
  auto_trading_enabled     BOOLEAN DEFAULT FALSE,
  auto_trading_enabled_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_username ON public.users(username);
CREATE UNIQUE INDEX idx_users_email    ON public.users(email);


-- =====================================================
-- 2. PORTFOLIOS
-- =====================================================
-- cash: stored as TEXT to avoid floating point issues
-- holdings: JSONB object like:
--   {
--     "bitcoin":  { "amount": "0.5",  "averagePrice": "95000" },
--     "ethereum": { "amount": "2.0",  "averagePrice": "3500"  },
--     "solana":   { "amount": "100",  "averagePrice": "145"   }
--   }
-- =====================================================
CREATE TABLE public.portfolios (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cash      TEXT DEFAULT '0.00',
  holdings  JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id)
);

CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);


-- =====================================================
-- 3. TRANSACTIONS
-- =====================================================
CREATE TABLE public.transactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'deposit', 'withdraw')),
  coin_id    TEXT,
  coin_name  TEXT,
  amount     TEXT,
  price      TEXT,
  total      TEXT,
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id   ON public.transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON public.transactions(timestamp DESC);


-- =====================================================
-- 4. PUMPS
-- =====================================================
-- Admin-initiated fake price increases per user per coin
-- The app reads is_active = true pumps and gradually
-- increases the user's displayed holdings value
-- =====================================================
CREATE TABLE public.pumps (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coin_id               TEXT NOT NULL,
  percentage            NUMERIC NOT NULL,
  duration_minutes      INTEGER NOT NULL,
  start_time            TIMESTAMPTZ DEFAULT NOW(),
  end_time              TIMESTAMPTZ,
  is_active             BOOLEAN DEFAULT TRUE,
  completed_percentage  NUMERIC DEFAULT 0,
  initial_amount        TEXT,
  current_gain_amount   TEXT DEFAULT '0'
);

CREATE INDEX idx_pumps_user_id   ON public.pumps(user_id);
CREATE INDEX idx_pumps_is_active ON public.pumps(is_active);


-- =====================================================
-- 5. WATCHLISTS
-- =====================================================
CREATE TABLE public.watchlists (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coins    TEXT[] DEFAULT '{}',
  UNIQUE(user_id)
);

CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);


-- =====================================================
-- VERIFY - should return 5 rows
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'portfolios', 'transactions', 'pumps', 'watchlists')
ORDER BY table_name;
