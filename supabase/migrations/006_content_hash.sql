-- Migration: 006_content_hash
-- Purpose: Adds cryptographic hash column to prevent exact duplicate RSS content ingestion.

ALTER TABLE public.aggregated_content 
ADD COLUMN IF NOT EXISTS content_hash TEXT UNIQUE;

-- Create an index for fast duplicate checking
CREATE INDEX IF NOT EXISTS idx_aggregated_content_hash ON public.aggregated_content(content_hash);
