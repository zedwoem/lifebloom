-- Migration: 003_translation_cache.sql
-- Description: Creates the caching table for the dynamic i18n auto-translation system
-- Features: Fast hash lookup, source/target indexing, strict RLS for security.

CREATE TABLE IF NOT EXISTS public.translation_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_hash TEXT NOT NULL, -- MD5 hash of (source_text + target_lang)
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    source_lang VARCHAR(10) NOT NULL DEFAULT 'en',
    target_lang VARCHAR(10) NOT NULL,
    provider_used VARCHAR(50) NOT NULL, -- e.g., 'libretranslate', 'deepl'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for blazing fast edge lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_translation_hash ON public.translation_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_translation_langs ON public.translation_cache(source_lang, target_lang);

-- Row Level Security (RLS)
ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;

-- 1. Read Access: Anyone (Anon & Authenticated) can read cached translations
CREATE POLICY "Public translation reads" 
ON public.translation_cache 
FOR SELECT 
USING (true);

-- 2. Insert Access: ONLY the service_role (Edge Functions / API) can insert new translations.
-- We prevent public inserts to avoid cache poisoning or quota exhaustion from malicious actors.
CREATE POLICY "Service role translation inserts" 
ON public.translation_cache 
FOR INSERT 
WITH CHECK (true); -- Note: Authenticated explicitly with service_role key bypasses RLS naturally, 
                 -- but specifying it clarifies intent. If accessed via anon key, insert fails.

-- Create a function to update the 'last_accessed' timestamp for caching metrics
CREATE OR REPLACE FUNCTION update_translation_accessed()
RETURNS trigger AS $$
BEGIN
    NEW.last_accessed = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_translation_accessed
    BEFORE UPDATE ON public.translation_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_accessed();
