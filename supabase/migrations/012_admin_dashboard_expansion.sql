-- supabase/migrations/012_admin_dashboard_expansion.sql
-- Description: Implement affiliate click tracking, API health logs, and admin secure RPCs.

-- Add description and transcript to videos table
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS transcript JSONB DEFAULT '[]'::jsonb;

-- Recreate RPC function get_latest_videos to include description and transcript
CREATE OR REPLACE FUNCTION public.get_latest_videos(p_limit INT DEFAULT 3, p_locale TEXT DEFAULT 'en', p_pillar TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    title TEXT,
    embed_id TEXT,
    provider TEXT,
    pillar TEXT,
    locale TEXT,
    description TEXT,
    transcript JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT v.id, v.title, v.embed_id, v.provider, v.pillar, v.locale, v.description, v.transcript, v.created_at
    FROM public.videos v
    WHERE v.locale = p_locale
    AND (p_pillar IS NULL OR v.pillar = p_pillar)
    ORDER BY v.created_at DESC
    LIMIT p_limit;
END;
$$;

-- Add is_approved to aggregated_content to hide/show items from public feed
ALTER TABLE public.aggregated_content ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Grant admin manage permissions on aggregated_content
CREATE POLICY "Allow admin to manage aggregated_content"
    ON public.aggregated_content FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Grant admin manage permissions on translation_cache
CREATE POLICY "Allow admin to manage translation_cache"
    ON public.translation_cache FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Grant admin select permissions on users
CREATE POLICY "Allow admin to select all users"
    ON public.users FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Grant admin select permissions on user_progress
CREATE POLICY "Allow admin to select all user progress"
    ON public.user_progress FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Grant admin select permissions on calculations_history
CREATE POLICY "Allow admin to select all calculations history"
    ON public.calculations_history FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Grant admin select permissions on saved_items
CREATE POLICY "Allow admin to select all saved items"
    ON public.saved_items FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Grant admin manage permissions on videos
CREATE POLICY "Allow admin to manage videos library"
    ON public.videos FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 1. Tabel Pelacakan CTR Afiliasi & Kampanye B2B
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    link_type TEXT NOT NULL CHECK (link_type IN ('affiliate_product', 'sponsored_placement', 'editorial_outgoing')),
    pillar TEXT NOT NULL CHECK (pillar IN ('home', 'money', 'pet', 'senior', 'travel')),
    referenced_id TEXT NOT NULL,
    target_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing untuk akselerasi kueri grafik Recharts mingguan
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_perf ON public.affiliate_clicks (pillar, link_type, created_at DESC);

-- Enable RLS on affiliate_clicks
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on affiliate clicks"
    ON public.affiliate_clicks FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow anyone to insert affiliate clicks"
    ON public.affiliate_clicks FOR INSERT
    WITH CHECK (true);

-- 2. Tabel Monitor Latensi API Eksternal
CREATE TABLE IF NOT EXISTS public.api_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_name TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms NUMERIC(8,2) NOT NULL,
    error_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_health_time ON public.api_health_logs (api_name, created_at DESC);

-- Enable RLS on api_health_logs
ALTER TABLE public.api_health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin select on health logs"
    ON public.api_health_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow service role all access on health logs"
    ON public.api_health_logs FOR ALL
    USING (true);

-- 3. SECURE RPC: Modifikasi Peran Keanggotaan Terproteksi
CREATE OR REPLACE FUNCTION public.update_user_role_secure(
    user_id_param UUID,
    new_role_param TEXT
)
RETURNS void AS $$
BEGIN
    -- Validasi kaku otorisasi admin pemanggil sesi
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Operasi ini membutuhkan hak administratif khusus.';
    END IF;

    -- Validasi input jenis role
    IF new_role_param NOT IN ('admin', 'expert', 'user') THEN
        RAISE EXCEPTION 'Input tidak valid: Peran harus berupa admin, expert, atau user.';
    END IF;

    UPDATE public.users 
    SET role = new_role_param, updated_at = now()
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SECURE RPC: Manajemen Logika Akumulasi & Penyesuaian Poin Manual
CREATE OR REPLACE FUNCTION public.adjust_bloom_points_secure(
    user_id_param UUID,
    points_delta_param INTEGER
)
RETURNS void AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Operasi ini membutuhkan hak administratif khusus.';
    END IF;

    -- Tambah/kurang poin di user_progress
    UPDATE public.user_progress
    SET bloom_points = greatest(0, bloom_points + points_delta_param), updated_at = now()
    WHERE user_id = user_id_param;

    -- Tambah/kurang poin di public.users untuk konsistensi
    UPDATE public.users
    SET bloom_points = greatest(0, bloom_points + points_delta_param), updated_at = now()
    WHERE id = user_id_param;

    -- Catat jejak audit penyesuaian ke log aktivitas
    INSERT INTO public.activity_logs (user_id, action_type, points_awarded)
    VALUES (user_id_param, 'admin_adjustment', points_delta_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
