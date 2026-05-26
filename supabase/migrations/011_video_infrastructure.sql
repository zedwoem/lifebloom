-- supabase/migrations/011_video_infrastructure.sql
-- Create videos table for metadata management

CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    embed_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('youtube', 'vimeo')),
    pillar TEXT NOT NULL,
    locale TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on videos"
ON public.videos FOR SELECT
TO public
USING (true);

-- Create RPC function get_latest_videos
CREATE OR REPLACE FUNCTION public.get_latest_videos(p_limit INT DEFAULT 3, p_locale TEXT DEFAULT 'en', p_pillar TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    title TEXT,
    embed_id TEXT,
    provider TEXT,
    pillar TEXT,
    locale TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT v.id, v.title, v.embed_id, v.provider, v.pillar, v.locale, v.created_at
    FROM public.videos v
    WHERE v.locale = p_locale
    AND (p_pillar IS NULL OR v.pillar = p_pillar)
    ORDER BY v.created_at DESC
    LIMIT p_limit;
END;
$$;
