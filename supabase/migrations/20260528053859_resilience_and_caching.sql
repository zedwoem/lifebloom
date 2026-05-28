-- Resilience and Caching Schema (Hardened)

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    service TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    details JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.circuit_breakers (
    service_name TEXT PRIMARY KEY,
    state TEXT NOT NULL DEFAULT 'CLOSED',
    failure_count INTEGER NOT NULL DEFAULT 0,
    last_failure TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.rss_cache (
    url TEXT PRIMARY KEY,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    data JSONB NOT NULL,
    pillar TEXT
);

-- Enhanced Idempotency
CREATE TABLE IF NOT EXISTS public.scheduler_state (
    job_name TEXT PRIMARY KEY,
    last_attempt TIMESTAMPTZ,
    last_successful_run TIMESTAMPTZ,
    status TEXT, -- 'success' or 'failed'
    error_message TEXT
);

-- Enable RLS
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_breakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduler_state ENABLE ROW LEVEL SECURITY;

-- Block public access (only accessible internally via Service Role or Edge Functions)
CREATE POLICY "Block anon and authenticated api_usage_logs" ON public.api_usage_logs FOR ALL TO PUBLIC USING (false);
CREATE POLICY "Block anon and authenticated circuit_breakers" ON public.circuit_breakers FOR ALL TO PUBLIC USING (false);
CREATE POLICY "Block anon and authenticated rss_cache" ON public.rss_cache FOR ALL TO PUBLIC USING (false);
CREATE POLICY "Block anon and authenticated scheduler_state" ON public.scheduler_state FOR ALL TO PUBLIC USING (false);

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the ingest function every 4 hours using pg_cron
-- Replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY
SELECT cron.schedule('lifebloom-ingest-4h', '0 */4 * * *', 
  $$ SELECT net.http_post(
       'https://YOUR_PROJECT_REF.supabase.co/functions/v1/ingest',
       '{"pillar": "all", "source": "pg_cron"}'::jsonb,
       '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
     );
  $$);

-- Daily Summary Query (Monitoring)
-- A helper view to track daily limits (GNews max 100)
CREATE OR REPLACE VIEW public.daily_api_usage_summary AS
SELECT 
    date_trunc('day', timestamp) AS usage_date,
    service,
    SUM(count) AS total_calls
FROM public.api_usage_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 1 DESC;
