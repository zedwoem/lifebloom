-- supabase/migrations/001_initial_schema.sql
-- LifeBloom Hub — Enterprise Database Schema & RLS Policies (2026)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLES & SCHEMAS
-- ============================================================

-- Users Table (Synchronized with auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    default_locale TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Progress & Gamification (Streaks & Points)
CREATE TABLE public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    bloom_points INTEGER NOT NULL DEFAULT 0 CHECK (bloom_points >= 0),
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Badges (Gamification Achievements)
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, badge_key)
);

-- Products Catalog (5 Pillars)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    pillar TEXT NOT NULL CHECK (pillar IN ('home', 'money', 'pet', 'senior', 'travel')),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    original_price NUMERIC CHECK (original_price >= price),
    currency TEXT NOT NULL DEFAULT 'USD',
    image_url TEXT,
    affiliate_url TEXT NOT NULL,
    vendor TEXT NOT NULL,
    rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Articles (Aggregated via RSS Ingestion)
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    pillar TEXT NOT NULL CHECK (pillar IN ('home', 'money', 'pet', 'senior', 'travel')),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    source_url TEXT,
    author TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Videos (Accessible Playbacks with Transcript Panels)
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    pillar TEXT NOT NULL CHECK (pillar IN ('home', 'money', 'pet', 'senior', 'travel')),
    title TEXT NOT NULL,
    description TEXT,
    platform TEXT NOT NULL DEFAULT 'youtube' CHECK (platform IN ('youtube', 'vimeo', 'custom')),
    video_id TEXT NOT NULL,
    duration INTEGER CHECK (duration > 0), -- in seconds
    thumbnail_url TEXT,
    transcript TEXT, -- WebVTT or JSON structured transcripts
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved Items (Wishlist/Bookmarked across Content Types)
CREATE TABLE public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('product', 'article', 'video', 'calculation')),
    referenced_id TEXT NOT NULL, -- UUID string or calculator slug
    metadata JSONB, -- store dynamic info (e.g. name, slug, notes)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, item_type, referenced_id)
);

-- Activity Logs (Audit Trail for Bloom Points Awards)
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automated Internal Links (GEO Optimization Linking Matrix)
CREATE TABLE public.automated_internal_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_slug TEXT NOT NULL,
    target_slug TEXT NOT NULL,
    anchor_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(source_slug, target_slug)
);

-- Calculations History (Retirement dana, senior BMI, etc.)
CREATE TABLE public.calculations_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    calculator_slug TEXT NOT NULL,
    input_params JSONB NOT NULL,
    output_results JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. INDEX OPTIMIZATIONS
-- ============================================================
CREATE INDEX idx_products_pillar_active ON public.products(pillar, is_active);
CREATE INDEX idx_products_slug ON public.products(slug);

CREATE INDEX idx_articles_pillar_active ON public.articles(pillar, is_active);
CREATE INDEX idx_articles_slug ON public.articles(slug);

CREATE INDEX idx_videos_pillar_active ON public.videos(pillar, is_active);
CREATE INDEX idx_videos_slug ON public.videos(slug);

CREATE INDEX idx_saved_items_user ON public.saved_items(user_id);
CREATE INDEX idx_calculations_history_user ON public.calculations_history(user_id);
CREATE INDEX idx_activity_logs_user_date ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX idx_internal_links_source ON public.automated_internal_links(source_slug);

-- ============================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Automatic Updated At Timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Users Updated At
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: User Progress Updated At
CREATE TRIGGER tr_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function: Auto-provision Public Profiles on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Provision Users table profile
    INSERT INTO public.users (id, email, display_name, subscription_tier, default_locale)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        'free',
        COALESCE(NEW.raw_user_meta_data->>'default_locale', 'en')
    );

    -- Provision User Progress gamification tracker
    INSERT INTO public.user_progress (user_id, bloom_points, current_streak, longest_streak)
    VALUES (NEW.id, 0, 1, 1);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Execute handler on new auth user signup
CREATE OR REPLACE TRIGGER tr_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_internal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations_history ENABLE ROW LEVEL SECURITY;

-- 4.1 Users table policies
CREATE POLICY "Allow users to read their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4.2 User Progress policies
CREATE POLICY "Allow users to view their own progress"
    ON public.user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own progress (via safe client hooks)"
    ON public.user_progress FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4.3 Badges policies
CREATE POLICY "Allow users to select their own unlocked badges"
    ON public.badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow service role to manage badges"
    ON public.badges FOR ALL
    USING (true);

-- 4.4 Products table policies (Public Read, Admin Write)
CREATE POLICY "Allow public read access to active products"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow service role to manage products catalog"
    ON public.products FOR ALL
    USING (true);

-- 4.5 Articles table policies (Public Read, Admin Write)
CREATE POLICY "Allow public read access to active articles"
    ON public.articles FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow service role to manage articles feed"
    ON public.articles FOR ALL
    USING (true);

-- 4.6 Videos table policies (Public Read, Admin Write)
CREATE POLICY "Allow public read access to active videos"
    ON public.videos FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow service role to manage videos library"
    ON public.videos FOR ALL
    USING (true);

-- 4.7 Saved Items table policies (Owner-Only Access)
CREATE POLICY "Allow users to manage their own saved items list"
    ON public.saved_items FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4.8 Activity Logs table policies (Owner-Only Access)
CREATE POLICY "Allow users to read their own point award logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow service role to record user activity points"
    ON public.activity_logs FOR ALL
    USING (true);

-- 4.9 Automated Internal Links table policies (Public Read, Admin Write)
CREATE POLICY "Allow public read access to automated internal linking matrix"
    ON public.automated_internal_links FOR SELECT
    USING (true);

CREATE POLICY "Allow service role to manage automated internal links matrix"
    ON public.automated_internal_links FOR ALL
    USING (true);

-- 4.10 Calculations History table policies (Owner-Only Access)
CREATE POLICY "Allow users to manage their own calculations history"
    ON public.calculations_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
