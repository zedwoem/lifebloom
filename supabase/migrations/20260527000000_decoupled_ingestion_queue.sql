-- Migration: 023_decoupled_ingestion_queue.sql
-- Add status columns and scraped text variables for deep indexing
ALTER TABLE public.canonical_articles 
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS raw_scraped_content TEXT,
ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Create an index to quickly pull the oldest pending articles for batch execution
CREATE INDEX IF NOT EXISTS idx_canonical_articles_processing_status 
ON public.canonical_articles(processing_status) 
WHERE processing_status = 'pending';
