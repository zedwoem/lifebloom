-- Migration: 008_dynamic_authorship.sql
-- Description: Expert Profiles and Authorship Verification Table for E-E-A-T SEO, plus product index

-- 1. Create expert_profiles table
CREATE TABLE IF NOT EXISTS expert_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    orcid_id TEXT,
    wikidata_id TEXT,
    google_scholar_url TEXT,
    h_index INTEGER DEFAULT 0,
    citation_count INTEGER DEFAULT 0,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add Row Level Security for expert_profiles
ALTER TABLE expert_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
ON expert_profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own profile."
ON expert_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_expert_profiles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expert_profiles_modtime
    BEFORE UPDATE ON expert_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_expert_profiles_updated_at_column();

-- 4. Modifikasi `products`
ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS price_current DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS price_original DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en',
    ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;

-- Optimasi indeks majemuk
CREATE INDEX IF NOT EXISTS idx_products_slug_pillar ON products (slug, pillar);

-- 5. Modifikasi `saved_items` untuk membatasi redundansi
ALTER TABLE saved_items 
    DROP CONSTRAINT IF EXISTS unique_saved_item_per_user;

ALTER TABLE saved_items
    ADD CONSTRAINT unique_saved_item_per_user UNIQUE(user_id, item_type, referenced_id);

-- 6. Fungsi RPC Increment Bloom Points
CREATE OR REPLACE FUNCTION increment_user_bloom_points(user_id_param UUID, amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This assumes there's a user_metrics table tracking bloom points.
    -- If it doesn't exist yet, you can create it or update users table.
    UPDATE users 
    SET bloom_points = COALESCE(bloom_points, 0) + amount
    WHERE id = user_id_param;
END;
$$;

-- 7. Fungsi RPC Edge Proxy award_points_secure
CREATE OR REPLACE FUNCTION award_points_secure(user_id_param UUID, amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Secure proxy point increment
    UPDATE users 
    SET bloom_points = COALESCE(bloom_points, 0) + amount
    WHERE id = user_id_param;
END;
$$;
