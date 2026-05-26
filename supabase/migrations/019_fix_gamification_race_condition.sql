-- Migration: Fix Gamification Race Condition using Advisory Locks
-- Prevents concurrent calls to award_points_secure from bypassing the daily limit.

CREATE OR REPLACE FUNCTION public.award_points_secure(
    p_user_id UUID,
    p_points INTEGER,
    p_action_type TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points_today INTEGER;
    v_daily_limit CONSTANT INTEGER := 150; -- Anti-abuse threshold
    v_new_total INTEGER;
BEGIN
    -- Only allow authenticated user sessions or service role to trigger this
    IF auth.role() <> 'authenticated' AND auth.role() <> 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized session role for point rewards';
    END IF;

    -- Obtain a transaction-level advisory lock on the user id to prevent concurrent execution
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

    -- Calculate total points awarded to the user today
    SELECT COALESCE(SUM(points_awarded), 0)
    INTO v_points_today
    FROM public.activity_logs
    WHERE user_id = p_user_id
      AND created_at::DATE = CURRENT_DATE;

    -- Check if daily reward limit has been exceeded
    IF v_points_today + p_points > v_daily_limit THEN
        -- Daily limit hit, cap the reward or skip addition
        p_points := LEAST(p_points, v_daily_limit - v_points_today);
        IF p_points <= 0 THEN
            -- Skip addition entirely
            SELECT bloom_points INTO v_new_total FROM public.user_progress WHERE user_id = p_user_id;
            RETURN v_new_total;
        END IF;
    END IF;

    -- Record the transaction in the activity audit logs
    INSERT INTO public.activity_logs (user_id, action_type, points_awarded)
    VALUES (p_user_id, p_action_type, p_points);

    -- Increment the user progress bloom points total
    UPDATE public.user_progress
    SET bloom_points = bloom_points + p_points
    WHERE user_id = p_user_id;

    -- Update the users table for points consistency
    UPDATE public.users
    SET bloom_points = bloom_points + p_points
    WHERE id = p_user_id;

    -- Get new total
    SELECT bloom_points INTO v_new_total FROM public.user_progress WHERE user_id = p_user_id;

    -- Unlock achievement badges if milestones are met
    IF v_new_total >= 100 THEN
        INSERT INTO public.badges (user_id, badge_key)
        VALUES (p_user_id, 'century_club')
        ON CONFLICT (user_id, badge_key) DO NOTHING;
    END IF;

    RETURN v_new_total;
END;
$$;
