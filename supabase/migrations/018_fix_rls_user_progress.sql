-- Fix RLS user_progress: Prevent direct client-side updates to critical gamification metrics (bloom_points, streaks).
-- Only allow authenticated users to update safe columns (last_login_date, updated_at).

-- 1. Drop the insecure policy that allows full updates
DROP POLICY IF EXISTS "Allow users to update their own progress (via safe client hooks)" ON public.user_progress;

-- 2. Revoke general update privileges on the table
REVOKE UPDATE ON public.user_progress FROM authenticated;
REVOKE UPDATE ON public.user_progress FROM anon;
REVOKE UPDATE ON public.user_progress FROM PUBLIC;

-- 3. Grant select on all columns to authenticated users
GRANT SELECT ON public.user_progress TO authenticated;

-- 4. Grant update ONLY on safe columns to authenticated users
GRANT UPDATE(last_login_date, updated_at) ON public.user_progress TO authenticated;

-- 5. Re-create the update policy constrained to authenticated users
CREATE POLICY "Allow users to update safe progress columns"
    ON public.user_progress FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
