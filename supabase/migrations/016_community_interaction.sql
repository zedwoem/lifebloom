-- migration 016_community_interaction.sql  
-- Description: Establishes Comments, Realtime Guestbook, and Contact Ingestion Tables with Strict RLS

-- 1. Comments Table (Cusdis-style adaptation)  
CREATE TABLE IF NOT EXISTS public.comments (  
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,  
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Supports nested replies  
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,     -- Nullable for anonymous  
  author_name TEXT NOT NULL,  
  author_email TEXT,  
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),  
  is_approved BOOLEAN DEFAULT false,                              -- Moderation queue  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

-- Optimize search with index keys  
CREATE INDEX IF NOT EXISTS idx_comments_article_approved ON public.comments(article_id) WHERE is_approved = true;  
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- Enable RLS  
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comment Policies  
CREATE POLICY "Anyone can read approved comments" ON public.comments  
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can submit a comment" ON public.comments  
  FOR INSERT WITH CHECK (is_approved = false); -- Forced to false for moderation

CREATE POLICY "Only admins can moderate comments" ON public.comments  
  FOR ALL TO authenticated  
  USING (public.is_admin() = true); -- Utilizing established project helper

-- 2. Realtime Guestbook Table (Lee Robinson Pattern)  
CREATE TABLE IF NOT EXISTS public.guestbook (  
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,  
  author_name TEXT NOT NULL,  
  content TEXT NOT NULL CHECK (char_length(content) <= 500),  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

-- Register Guestbook into the Supabase Realtime Publication  
ALTER publication supabase_realtime ADD TABLE public.guestbook;

-- Enable RLS  
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

-- Guestbook Policies  
CREATE POLICY "Public read access to guestbook" ON public.guestbook  
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit to guestbook" ON public.guestbook  
  FOR INSERT TO authenticated  
  WITH CHECK (auth.uid() = user_id AND char_length(content) > 0);

CREATE POLICY "Users can delete their own guestbook message" ON public.guestbook  
  FOR DELETE TO authenticated  
  USING (auth.uid() = user_id);

-- 3. Contact & Partner Ingest Table  
CREATE TABLE IF NOT EXISTS public.contact_submissions (  
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  name TEXT NOT NULL,  
  email TEXT NOT NULL,  
  company_name TEXT,  
  category TEXT NOT NULL CHECK (category IN ('general', 'expert_join', 'sponsor_inquiry')),  
  message TEXT NOT NULL CHECK (char_length(message) <= 5000),  
  is_reviewed BOOLEAN DEFAULT false,  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL  
);

-- Enable RLS  
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Ingest Policies  
CREATE POLICY "Anyone can submit a contact form" ON public.contact_submissions  
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contact submissions" ON public.contact_submissions  
  FOR SELECT TO authenticated  
  USING (public.is_admin() = true);  
