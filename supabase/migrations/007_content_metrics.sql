-- Migration 007: Content Metrics & Views Tracking

-- 1. Create content_metrics table
CREATE TABLE IF NOT EXISTS public.content_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR NOT NULL UNIQUE,       -- e.g., 'money/retirement-planner', 'article/medicare-part-d'
    content_type VARCHAR NOT NULL,      -- 'tool', 'article', 'page'
    title VARCHAR NOT NULL,
    category VARCHAR,
    
    total_views BIGINT DEFAULT 0,
    trending_score FLOAT DEFAULT 0.0,
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create page_views table for granular tracking
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR NOT NULL REFERENCES public.content_metrics(slug) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Indexes for fast querying
CREATE INDEX idx_content_metrics_total_views ON public.content_metrics(total_views DESC);
CREATE INDEX idx_content_metrics_trending_score ON public.content_metrics(trending_score DESC);
CREATE INDEX idx_page_views_slug ON public.page_views(slug);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at DESC);

-- 4. Enable RLS
ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Everyone can read content metrics
CREATE POLICY "Public can read content_metrics" ON public.content_metrics
    FOR SELECT USING (true);

-- No public insert/update/delete directly on content_metrics (handled via RPC)

-- Everyone can insert page_views (handled via RPC to bypass RLS safely, but we allow authenticated/anon to insert via service role usually. We'll secure it by allowing insert)
CREATE POLICY "Anyone can insert page_views" ON public.page_views
    FOR INSERT WITH CHECK (true);

-- 6. RPC: Increment View (Upserts content_metrics and logs page_views)
CREATE OR REPLACE FUNCTION increment_content_view(
    p_slug VARCHAR,
    p_type VARCHAR,
    p_title VARCHAR,
    p_category VARCHAR,
    p_user_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as database owner to bypass RLS for upserting
AS $$
BEGIN
    -- 1. Upsert into content_metrics
    INSERT INTO public.content_metrics (slug, content_type, title, category, total_views, trending_score, last_updated)
    VALUES (p_slug, p_type, p_title, p_category, 1, 1.0, NOW())
    ON CONFLICT (slug) DO UPDATE 
    SET 
        total_views = public.content_metrics.total_views + 1,
        trending_score = public.content_metrics.trending_score + 1.0,
        title = EXCLUDED.title, -- Keep title/category fresh if it changes
        category = EXCLUDED.category,
        last_updated = NOW();

    -- 2. Log granular view
    INSERT INTO public.page_views (slug, user_id, viewed_at)
    VALUES (p_slug, p_user_id, NOW());
END;
$$;

-- 7. RPC: Decay Trending Score
-- This can be called by a cron job once a day
CREATE OR REPLACE FUNCTION decay_trending_scores()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.content_metrics
    SET trending_score = trending_score * 0.5
    WHERE trending_score > 0.01; -- Don't bother decaying infinitely small numbers
$$;
