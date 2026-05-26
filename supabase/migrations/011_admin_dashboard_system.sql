-- Migration: 011_admin_dashboard_system.sql
-- Description: Implement role and bloom points columns, elevate_to_admin RPC, B2B Placements table, and logs.

-- 1. Ensure columns exist on public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'expert'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bloom_points INTEGER DEFAULT 0;

-- 2. Create RPC function to elevate designated admin email
CREATE OR REPLACE FUNCTION public.elevate_to_admin(email_param TEXT)
RETURNS VOID AS $$
BEGIN
    IF email_param = 'liorazedwoem@gmail.com' THEN
        UPDATE public.users
        SET role = 'admin'
        WHERE email = email_param;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create helper function to check if requesting user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create B2B Placements table for monetization
CREATE TABLE IF NOT EXISTS public.b2b_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    contract_start TIMESTAMPTZ NOT NULL,
    contract_end TIMESTAMPTZ NOT NULL,
    target_url TEXT NOT NULL,
    pinned_calculator TEXT,
    pinned_row_position INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for auto updated_at
CREATE TRIGGER tr_b2b_placements_updated_at
    BEFORE UPDATE ON public.b2b_placements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on b2b_placements
ALTER TABLE public.b2b_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on active placements"
    ON public.b2b_placements FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow admin full manage access on placements"
    ON public.b2b_placements FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Create system_cron_logs table for execution health monitoring
CREATE TABLE IF NOT EXISTS public.system_cron_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    run_time TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL,
    duplicates_blocked INTEGER DEFAULT 0,
    items_processed INTEGER DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_system_cron_logs_job_time 
    ON public.system_cron_logs(job_name, run_time DESC);

-- Enable RLS on system_cron_logs
ALTER TABLE public.system_cron_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin select on cron logs"
    ON public.system_cron_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow service role all access on cron logs"
    ON public.system_cron_logs FOR ALL
    USING (true);

-- 6. Create bot_ingestion_logs table to track AI search crawlers
CREATE TABLE IF NOT EXISTS public.bot_ingestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_name TEXT NOT NULL,
    slug TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_ingestion_logs_created_at
    ON public.bot_ingestion_logs(created_at DESC);

-- Enable RLS on bot_ingestion_logs
ALTER TABLE public.bot_ingestion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin select on bot logs"
    ON public.bot_ingestion_logs FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow service role all access on bot logs"
    ON public.bot_ingestion_logs FOR ALL
    USING (true);

-- 7. Grant admin manage permissions on expert_profiles
CREATE POLICY "Allow admin to manage expert profiles"
    ON public.expert_profiles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Pre-populate admin role for root email if exists
UPDATE public.users SET role = 'admin' WHERE email = 'liorazedwoem@gmail.com';
