-- Migration: Fix Massive RLS Bypass (Missing TO service_role clause)
-- Drops all service role policies that defaulted to PUBLIC (allowing all users full write/select/delete access) and re-creates them explicitly restricted to the service_role.

-- 1. badges Table
DROP POLICY IF EXISTS "Allow service role to manage badges" ON public.badges;
CREATE POLICY "Allow service role to manage badges"
    ON public.badges FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. products Table
DROP POLICY IF EXISTS "Allow service role to manage products catalog" ON public.products;
CREATE POLICY "Allow service role to manage products catalog"
    ON public.products FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. articles Table
DROP POLICY IF EXISTS "Allow service role to manage articles feed" ON public.articles;
CREATE POLICY "Allow service role to manage articles feed"
    ON public.articles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. videos Table
DROP POLICY IF EXISTS "Allow service role to manage videos library" ON public.videos;
CREATE POLICY "Allow service role to manage videos library"
    ON public.videos FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. activity_logs Table
DROP POLICY IF EXISTS "Allow service role to record user activity points" ON public.activity_logs;
CREATE POLICY "Allow service role to record user activity points"
    ON public.activity_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. automated_internal_links Table
DROP POLICY IF EXISTS "Allow service role to manage automated internal links matrix" ON public.automated_internal_links;
CREATE POLICY "Allow service role to manage automated internal links matrix"
    ON public.automated_internal_links FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. system_cron_logs Table
DROP POLICY IF EXISTS "Allow service role all access on cron logs" ON public.system_cron_logs;
CREATE POLICY "Allow service role all access on cron logs"
    ON public.system_cron_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. bot_ingestion_logs Table
DROP POLICY IF EXISTS "Allow service role all access on bot logs" ON public.bot_ingestion_logs;
CREATE POLICY "Allow service role all access on bot logs"
    ON public.bot_ingestion_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 9. api_health_logs Table
DROP POLICY IF EXISTS "Allow service role all access on health logs" ON public.api_health_logs;
CREATE POLICY "Allow service role all access on health logs"
    ON public.api_health_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
