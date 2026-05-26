-- supabase/migrations/014_admin_marketing_and_operational_ops.sql
-- Description: Core schema additions for B2B click tracking, API health logs, and admin RPC security wrappers.

-- 1. Table Pelacakan CTR Afiliasi & Kampanye B2B Nasional
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    link_type TEXT NOT NULL CHECK (link_type IN ('affiliate_product', 'sponsored_placement', 'editorial_outgoing')),
    pillar TEXT NOT NULL CHECK (pillar IN ('home', 'money', 'pet', 'senior', 'travel')),
    referenced_id TEXT NOT NULL,
    target_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Penguncian Indeks Majemuk untuk Akselerasi Kueri Recharts Mingguan
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_analytics 
ON public.affiliate_clicks (pillar, link_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can insert tracking clicks, admin can view all
CREATE POLICY "Allow public insert to affiliate clicks"
    ON public.affiliate_clicks FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public select to affiliate clicks"
    ON public.affiliate_clicks FOR SELECT
    USING (true);

-- 2. Tabel Log Monitor Latensi API Eksternal
CREATE TABLE IF NOT EXISTS public.api_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_name TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms NUMERIC(8,2) NOT NULL,
    error_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_health_logs_timestamp 
ON public.api_health_logs (api_name, created_at DESC);

-- Enable RLS
ALTER TABLE public.api_health_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert logs or read
CREATE POLICY "Allow public insert to api health logs"
    ON public.api_health_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public select to api health logs"
    ON public.api_health_logs FOR SELECT
    USING (true);

-- Otorisasi Pembersihan Otomatis Data Log setelah 30 Hari (Anti-Bloat DB Policy)
CREATE OR REPLACE FUNCTION public.prune_old_api_health_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.api_health_logs 
    WHERE created_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. SECURE RPC: Modifikasi Peran Keanggotaan Tingkat Server
CREATE OR REPLACE FUNCTION public.update_user_role_secure(
    user_id_param UUID,
    new_role_param TEXT
)
RETURNS void AS $$
BEGIN
    -- Validasi kaku otorisasi admin melalui helper is_admin() berjalan
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Operasi ini membutuhkan hak administratif khusus.';
    END IF;

    -- Batasan tipe peran yang diizinkan masuk ke dalam sistem
    IF new_role_param NOT IN ('admin', 'expert', 'user') THEN
        RAISE EXCEPTION 'Input tidak valid: Peran harus berupa admin, expert, atau user.';
    END IF;

    UPDATE public.users 
    SET role = new_role_param, updated_at = now()
    WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SECURE RPC: Modifikasi Akumulasi Poin Ledger Manual
CREATE OR REPLACE FUNCTION public.adjust_bloom_points_secure(
    user_id_param UUID,
    points_delta_param INTEGER
)
RETURNS void AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Akses ditolak: Operasi ini membutuhkan hak administratif khusus.';
    END IF;

    UPDATE public.user_progress
    SET bloom_points = greatest(0, bloom_points + points_delta_param), updated_at = now()
    WHERE user_id = user_id_param;

    -- Injeksi Jejak Audit ke tabel activity_logs
    INSERT INTO public.activity_logs (user_id, action_type, points_awarded)
    VALUES (
        user_id_param, 
        'admin_adjustment', 
        points_delta_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
