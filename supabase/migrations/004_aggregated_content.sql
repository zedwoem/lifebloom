-- Migration: 004_aggregated_content
-- Purpose: Creates a table to store RSS/API aggregated content (Articles, Deals) for the 5 Pillars

CREATE TABLE IF NOT EXISTS public.aggregated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pillar TEXT NOT NULL,                  -- e.g., 'home', 'money', 'pet', 'senior', 'travel'
    source_type TEXT NOT NULL,             -- e.g., 'rss', 'api_fda', 'api_petfinder'
    source_name TEXT NOT NULL,             -- e.g., 'AARP', 'OpenFDA', 'Kiplinger'
    original_url TEXT,                     -- The external URL of the content
    
    -- Translations via smartTranslate
    title_en TEXT,
    title_id TEXT,
    title_es TEXT,
    title_fr TEXT,
    title_de TEXT,
    
    summary_en TEXT,
    summary_id TEXT,
    summary_es TEXT,
    summary_fr TEXT,
    summary_de TEXT,
    
    image_url TEXT,                        -- Extracted featured image
    metadata JSONB DEFAULT '{}'::JSONB,    -- Extra data (e.g., author, FDA recall ID)
    
    published_at TIMESTAMPTZ NOT NULL,     -- Date the original article was published
    created_at TIMESTAMPTZ DEFAULT NOW()   -- When our cron job ingested it
);

-- Enable RLS
ALTER TABLE public.aggregated_content ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read aggregated content
CREATE POLICY "Public can view aggregated content"
    ON public.aggregated_content
    FOR SELECT
    USING (true);

-- Indexes for fast querying by pillar and recency
CREATE INDEX IF NOT EXISTS idx_aggregated_content_pillar ON public.aggregated_content(pillar);
CREATE INDEX IF NOT EXISTS idx_aggregated_content_published_at ON public.aggregated_content(published_at DESC);
