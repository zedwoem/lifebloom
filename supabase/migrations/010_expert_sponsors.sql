-- Migration: 010_expert_sponsors.sql
-- Description: Expand expert_profiles to support institutions and brands, add approval workflow

-- Define enums for Entity Type and Status
CREATE TYPE profile_entity_type AS ENUM ('individual', 'organization', 'brand', 'institution');
CREATE TYPE profile_status AS ENUM ('pending', 'approved', 'rejected');

-- Add new columns to expert_profiles
ALTER TABLE expert_profiles 
    ADD COLUMN IF NOT EXISTS entity_type profile_entity_type DEFAULT 'individual',
    ADD COLUMN IF NOT EXISTS status profile_status DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS website_url TEXT,
    ADD COLUMN IF NOT EXISTS pillar_specialty TEXT;

-- Create index for quick approval and pillar lookups
CREATE INDEX IF NOT EXISTS idx_expert_profiles_status ON expert_profiles(status);
CREATE INDEX IF NOT EXISTS idx_expert_profiles_pillar ON expert_profiles(pillar_specialty);

-- RPC: Get Approved Sponsors/Experts by Pillar
CREATE OR REPLACE FUNCTION get_approved_sponsors_by_pillar(p_pillar TEXT, p_limit INTEGER DEFAULT 1)
RETURNS SETOF expert_profiles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM expert_profiles
    WHERE status = 'approved'
      AND pillar_specialty = p_pillar
    ORDER BY citation_count DESC NULLS LAST, h_index DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
