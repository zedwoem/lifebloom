-- Migration: 005_user_preferences
-- Purpose: Adds JSONB preferences column to users table for personalization

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Users are already allowed to update their own profile via RLS in 001_initial_schema.sql
-- CREATE POLICY "Allow users to update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
