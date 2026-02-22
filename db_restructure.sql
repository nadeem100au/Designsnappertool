-- =============================================
-- DESIGN SNAPPER — DB RESTRUCTURE
-- Run this entire file in Supabase SQL Editor
-- WARNING: Drops user_credits, credit_usage, transactions
-- The 'audits' table is NOT touched.
-- =============================================

-- ---- 1. DROP OLD TABLES ----
DROP TABLE IF EXISTS public.credit_usage CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;


-- ---- 2. CREATE: profiles ----
CREATE TABLE public.profiles (
  id          SERIAL PRIMARY KEY,          -- short human-readable number
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  username    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (used by edge functions)
CREATE POLICY "Service role full access on profiles"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');


-- ---- 3. CREATE: user_plan ----
CREATE TABLE public.user_plan (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan              TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exhausted')),
  audits_used       INTEGER NOT NULL DEFAULT 0,
  credits_remaining NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_credits     NUMERIC(10,3) NOT NULL DEFAULT 0,
  money_remaining   NUMERIC(10,2) NOT NULL DEFAULT 0,  -- internal INR tracking
  plan_started_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan"
  ON public.user_plan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_plan"
  ON public.user_plan FOR ALL
  USING (auth.role() = 'service_role');


-- ---- 4. CREATE: transactions ----
CREATE TABLE public.transactions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount               NUMERIC(10,2) NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'INR',
  status               TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  plan_upgraded_to     TEXT,           -- 'pro' on successful payment
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on transactions"
  ON public.transactions FOR ALL
  USING (auth.role() = 'service_role');


-- ---- 5. CREATE: audit_log ----
-- Replaces both credit_usage and session tracking
CREATE TABLE public.audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_at_time  TEXT NOT NULL DEFAULT 'starter',
  action        TEXT NOT NULL CHECK (action IN ('success', 'blocked', 'failed')),
  block_reason  TEXT CHECK (block_reason IN ('limit_reached', 'credits_exhausted', NULL)),
  ai_cost_usd   NUMERIC(10,6),   -- null for starter
  credits_used  NUMERIC(10,3),   -- null for starter
  money_deducted NUMERIC(10,2),  -- null for starter (internal INR)
  model_used    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit log"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on audit_log"
  ON public.audit_log FOR ALL
  USING (auth.role() = 'service_role');


-- ---- 6. INDEXES for performance ----
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_plan_user_id ON public.user_plan(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
