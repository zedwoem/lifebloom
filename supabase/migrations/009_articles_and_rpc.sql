-- Alter articles table for RSS ingestion & dynamic cards
ALTER TABLE public.articles
    ADD COLUMN IF NOT EXISTS hash_id TEXT UNIQUE, -- SHA-256 deduplication
    ADD COLUMN IF NOT EXISTS link TEXT,
    ADD COLUMN IF NOT EXISTS pub_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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
