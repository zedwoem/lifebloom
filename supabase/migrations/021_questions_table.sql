-- migration 021_questions_table.sql
-- Description: Ensures questions table and updates the policies to allow expert/admin answering

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  pillar TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  answer_content TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  expert_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Optimize search with index
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_expert_id ON public.questions(expert_id);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow public read questions" ON public.questions;
DROP POLICY IF EXISTS "Allow public insert questions" ON public.questions;
DROP POLICY IF EXISTS "Allow service role all on questions" ON public.questions;
DROP POLICY IF EXISTS "Allow experts/admins to update questions" ON public.questions;

-- Re-create / Create policies
CREATE POLICY "Allow public read questions" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert questions" ON public.questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role all on questions" ON public.questions
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow experts/admins to update questions" ON public.questions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('expert', 'admin')
    )
  );

-- Optimize comments index: Ensure parent_id is indexed
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
