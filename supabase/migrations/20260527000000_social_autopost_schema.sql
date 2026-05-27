-- Migration: 022_social_autopost_schema.sql
CREATE TABLE IF NOT EXISTS public.autopost_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'article' atau 'video'
    content_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'pinterest', 'threads', 'bluesky', 'mastodon', 'telegram'
    status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'skipped'
    hook_text TEXT,
    post_url VARCHAR(500),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.autopost_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to autopost logs for admin reporting
DROP POLICY IF EXISTS "Allow public read autopost_logs" ON public.autopost_logs;
CREATE POLICY "Allow public read autopost_logs" ON public.autopost_logs
    FOR SELECT USING (true);

-- Allow service role full admin privileges
DROP POLICY IF EXISTS "Allow service role all on autopost_logs" ON public.autopost_logs;
CREATE POLICY "Allow service role all on autopost_logs" ON public.autopost_logs
    TO service_role USING (true) WITH CHECK (true);
