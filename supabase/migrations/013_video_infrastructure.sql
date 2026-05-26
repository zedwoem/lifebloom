-- supabase/migrations/011_video_infrastructure.sql
-- Create videos table for metadata management

ALTER TABLE public.videos
    ADD COLUMN IF NOT EXISTS embed_id TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS provider TEXT CHECK (provider IN ('youtube', 'vimeo')),
    ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on videos"
ON public.videos FOR SELECT
TO public
USING (true);

-- Create RPC function get_latest_videos
DROP FUNCTION IF EXISTS public.get_latest_videos;
DROP FUNCTION IF EXISTS public.get_latest_videos(INT, TEXT, TEXT);
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
