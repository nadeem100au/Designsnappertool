-- ============================================
-- Credit System Tables for DesignSnapper
-- ============================================

-- 1. user_credits — one row per user, tracks plan and credit balance
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  credits_remaining NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_credits NUMERIC(10,3) NOT NULL DEFAULT 0,
  money_remaining NUMERIC(10,2) NOT NULL DEFAULT 0,
  audits_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can read their own credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own row (auto-created on first visit)
CREATE POLICY "Users can insert their own credits"
ON public.user_credits FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own credits
CREATE POLICY "Users can update their own credits"
ON public.user_credits FOR UPDATE
USING (auth.uid() = user_id);

-- Service role bypass for edge functions (handled automatically by service_role key)

-- ============================================

-- 2. credit_usage — log of every credit deduction
CREATE TABLE IF NOT EXISTS public.credit_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES public.audits(id) ON DELETE SET NULL,
  credits_deducted NUMERIC(10,3) NOT NULL DEFAULT 0,
  ai_cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  model_used TEXT,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.credit_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage history
CREATE POLICY "Users can view their own credit usage"
ON public.credit_usage FOR SELECT
USING (auth.uid() = user_id);

-- Insert allowed for service role (edge function uses service_role key)
-- No user-facing insert policy needed
