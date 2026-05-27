-- supabase/migrations/022_unified_affiliate_schema.sql
-- Description: Expands affiliate tracking for multi-network support with conversion webhooks.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Enhance affiliate_clicks for deep attribution
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.affiliate_clicks
ADD COLUMN IF NOT EXISTS network TEXT,
ADD COLUMN IF NOT EXISTS campaign_id TEXT,
ADD COLUMN IF NOT EXISTS sub_id1 TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS placement TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS user_agent_hash TEXT;

-- Composite index for analytics queries on pillar + network + date
CREATE INDEX IF NOT EXISTS idx_aff_clicks_network_pillar 
ON public.affiliate_clicks (network, pillar, created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. New: affiliate_conversions (S2S Webhook Receipts)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id         UUID        REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,
    network          TEXT        NOT NULL,
    transaction_id   TEXT        NOT NULL UNIQUE,
    commission_amount NUMERIC(10,2) NOT NULL,
    currency         TEXT        NOT NULL DEFAULT 'USD',
    status           TEXT        NOT NULL CHECK (status IN ('pending', 'approved', 'declined', 'paid')),
    user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    raw_payload      JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aff_conv_transaction ON public.affiliate_conversions (transaction_id);
CREATE INDEX IF NOT EXISTS idx_aff_conv_network     ON public.affiliate_conversions (network, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_conv_status      ON public.affiliate_conversions (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_aff_conversions_updated_at
BEFORE UPDATE ON public.affiliate_conversions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. RLS Policies — conversions are admin-only
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Only admin (via is_admin() RPC) can view conversions
CREATE POLICY "Admin can view all conversions"
    ON public.affiliate_conversions FOR SELECT
    USING (public.is_admin());

-- Inserts only via service_role (webhooks) — bypasses RLS
-- No INSERT policy needed; service_role is exempt

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Admin Analytics View: daily_affiliate_stats
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.daily_affiliate_stats AS
SELECT
    date_trunc('day', ac.created_at)::DATE  AS day,
    ac.network,
    ac.pillar,
    ac.placement,
    COUNT(ac.id)                            AS total_clicks,
    COUNT(conv.id)                          AS total_conversions,
    COALESCE(SUM(conv.commission_amount), 0) AS total_commission_usd
FROM public.affiliate_clicks ac
LEFT JOIN public.affiliate_conversions conv ON conv.click_id = ac.id
GROUP BY 1, 2, 3, 4;

COMMENT ON VIEW public.daily_affiliate_stats IS 'Pre-aggregated daily stats for the Admin Affiliate Analytics dashboard.';
