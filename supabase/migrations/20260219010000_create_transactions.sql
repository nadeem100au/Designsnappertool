-- Create the transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL, -- e.g., 'captured', 'failed'
  provider TEXT DEFAULT 'razorpay',
  order_id TEXT,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can view their own transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create Policy: Service Role can insert transactions (for Edge Functions)
-- Note: Service role bypasses RLS, but explicit policy can be good for documentation or if using stricter settings.
-- For standard setup, no insert policy is needed for authenticated users if only the backend inserts.
