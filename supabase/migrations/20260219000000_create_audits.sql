CREATE TABLE IF NOT EXISTS public.audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  thumbnail_url TEXT,
  project_name TEXT DEFAULT 'Untitled Project',
  analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits"
  ON public.audits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audits"
  ON public.audits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audits"
  ON public.audits FOR DELETE
  USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-images', 'audit-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload audit images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audit-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Public can view audit images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audit-images');
