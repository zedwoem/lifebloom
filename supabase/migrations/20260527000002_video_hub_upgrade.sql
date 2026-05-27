-- supabase/migrations/20260527000002_video_hub_upgrade.sql
-- Upgrade Video Hub to Premium Individual Video Pages

-- 1. Alter public.videos table
ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_helpful INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_insightful INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reaction_love INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transcript_status TEXT DEFAULT 'pending' CHECK (transcript_status IN ('pending', 'processing', 'done', 'failed'));

-- Update existing thumbnail_url for YouTube videos
UPDATE public.videos
SET thumbnail_url = 'https://img.youtube.com/vi/' || embed_id || '/maxresdefault.jpg'
WHERE provider = 'youtube' AND embed_id IS NOT NULL AND thumbnail_url IS NULL;

-- 2. Create public.video_transcripts table
CREATE TABLE IF NOT EXISTS public.video_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  segments JSONB,          -- [{start: float, end: float, text: string}]
  full_text TEXT,
  ai_summary TEXT,
  ai_chapters JSONB,       -- [{start_seconds: int, title: string}]
  language TEXT DEFAULT 'en',
  fetched_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_video_id UNIQUE (video_id)
);

-- Index for quick transcript lookups
CREATE INDEX IF NOT EXISTS idx_video_transcripts_video_id ON public.video_transcripts(video_id);

-- Enable RLS on video_transcripts
ALTER TABLE public.video_transcripts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to transcripts
DROP POLICY IF EXISTS "Allow public read access to transcripts" ON public.video_transcripts;
CREATE POLICY "Allow public read access to transcripts"
ON public.video_transcripts FOR SELECT
TO public
USING (true);

-- Allow service role to manage transcripts
DROP POLICY IF EXISTS "Allow service role to manage transcripts" ON public.video_transcripts;
CREATE POLICY "Allow service role to manage transcripts"
ON public.video_transcripts FOR ALL
USING (true);

-- 3. Upgrade get_latest_videos RPC function to support expanded columns and offset
DROP FUNCTION IF EXISTS public.get_latest_videos;
DROP FUNCTION IF EXISTS public.get_latest_videos(INT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_latest_videos(INT, TEXT, TEXT, INT);

CREATE OR REPLACE FUNCTION public.get_latest_videos(
    p_limit INT DEFAULT 12,
    p_locale TEXT DEFAULT 'en',
    p_pillar TEXT DEFAULT NULL,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    pillar TEXT,
    title TEXT,
    description TEXT,
    platform TEXT,
    video_id TEXT,
    duration INTEGER,
    thumbnail_url TEXT,
    view_count INTEGER,
    reaction_helpful INTEGER,
    reaction_insightful INTEGER,
    reaction_love INTEGER,
    transcript_status TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    embed_id TEXT,
    provider TEXT,
    locale TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id, 
        v.slug, 
        v.pillar, 
        v.title, 
        v.description, 
        v.platform, 
        v.video_id, 
        v.duration, 
        v.thumbnail_url, 
        v.view_count, 
        v.reaction_helpful, 
        v.reaction_insightful, 
        v.reaction_love, 
        v.transcript_status, 
        v.is_active, 
        v.created_at, 
        v.embed_id, 
        v.provider, 
        v.locale
    FROM public.videos v
    WHERE v.locale = p_locale
      AND v.is_active = true
      AND (p_pillar IS NULL OR v.pillar = p_pillar)
    ORDER BY v.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
