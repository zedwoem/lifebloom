-- migration 017_multi_author_publishing.sql  
-- Description: Overhauls articles table to support polymorphic expert and sponsor relationships

-- 1. Create Enums  
CREATE TYPE public.author_category AS ENUM ('user', 'expert', 'partner', 'sponsor', 'admin');  
CREATE TYPE public.article_publishing_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected');

-- 2. Alter Articles Table  
ALTER TABLE public.articles   
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,  
  ADD COLUMN IF NOT EXISTS author_type public.author_category DEFAULT 'user',  
  ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES public.expert_profiles(id) ON DELETE SET NULL, -- References Organization/Brands  
  ADD COLUMN IF NOT EXISTS status public.article_publishing_status DEFAULT 'draft',  
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

-- 3. Indexes for Publishing Performance  
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);  
CREATE INDEX IF NOT EXISTS idx_articles_status_type ON public.articles(status, author_type);  
CREATE INDEX IF NOT EXISTS idx_articles_sponsor_id ON public.articles(sponsor_id) WHERE sponsor_id IS NOT NULL;

-- 4. Protection for Existing Content (Mark legacy as approved)  
UPDATE public.articles SET status = 'approved' WHERE status IS NULL;

-- 5. Row-Level Security on Articles  
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles Policies  
DROP POLICY IF EXISTS "Public read approved active articles" ON public.articles;
CREATE POLICY "Public read approved active articles" ON public.articles  
  FOR SELECT USING (is_active = true AND status = 'approved');

DROP POLICY IF EXISTS "Authors can read their own submissions" ON public.articles;
CREATE POLICY "Authors can read their own submissions" ON public.articles  
  FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can insert drafts" ON public.articles;
CREATE POLICY "Authors can insert drafts" ON public.articles  
  FOR INSERT WITH CHECK (auth.uid() = author_id AND status = 'draft');

DROP POLICY IF EXISTS "Authors can update their own drafts" ON public.articles;
CREATE POLICY "Authors can update their own drafts" ON public.articles  
  FOR UPDATE USING (auth.uid() = author_id AND status IN ('draft', 'pending_review'))  
  WITH CHECK (status IN ('draft', 'pending_review'));

DROP POLICY IF EXISTS "Admins have total control over articles" ON public.articles;
CREATE POLICY "Admins have total control over articles" ON public.articles  
  FOR ALL TO authenticated  
  USING (public.is_admin() = true);  
