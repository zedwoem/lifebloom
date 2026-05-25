-- Create articles table for RSS ingestion & dynamic cards
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hash_id TEXT UNIQUE NOT NULL, -- SHA-256 deduplication
    title TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    pub_date TIMESTAMPTZ,
    pillar TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast pillar lookups & ordering
CREATE INDEX IF NOT EXISTS idx_articles_pillar ON public.articles(pillar);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON public.articles(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

-- RPC: Get Popular Posts by Pillar (Ordered by view_count)
CREATE OR REPLACE FUNCTION get_popular_posts_by_pillar(p_pillar TEXT, p_limit INTEGER DEFAULT 3)
RETURNS SETOF public.articles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.articles
    WHERE pillar = p_pillar
    ORDER BY view_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get Random Posts by Pillar (Optimized using TABLESAMPLE SYSTEM)
-- TABLESAMPLE SYSTEM is much faster than ORDER BY RANDOM() on large tables
CREATE OR REPLACE FUNCTION get_random_posts_by_pillar(p_pillar TEXT, p_limit INTEGER DEFAULT 3)
RETURNS SETOF public.articles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.articles TABLESAMPLE SYSTEM(10) -- Scans ~10% of pages
    WHERE pillar = p_pillar
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Get New Posts (Ordered by created_at)
CREATE OR REPLACE FUNCTION get_new_posts(p_limit INTEGER DEFAULT 5)
RETURNS SETOF public.articles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.articles
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
