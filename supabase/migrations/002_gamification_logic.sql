-- supabase/migrations/002_gamification_logic.sql
-- LifeBloom Hub — Gamification Streak Logic & Secure Points Awarding (2026)

-- ============================================================
-- 1. FUNCTIONS & PROCEDURES
-- ============================================================

-- Function: Securely award Bloom Points to a user with daily limit validation
CREATE OR REPLACE FUNCTION public.award_points_secure(
    p_user_id UUID,
    p_points INTEGER,
    p_action_type TEXT
)
RETURNS INTEGER
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
    WHERE user_id = p_user_id
    RETURNING bloom_points INTO v_new_total;

    -- Unlock achievement badges if milestones are met
    IF v_new_total >= 100 THEN
        INSERT INTO public.badges (user_id, badge_key)
        VALUES (p_user_id, 'century_club')
        ON CONFLICT (user_id, badge_key) DO NOTHING;
    END IF;

    IF v_new_total >= 500 THEN
        INSERT INTO public.badges (user_id, badge_key)
        VALUES (p_user_id, 'bloom_master')
        ON CONFLICT (user_id, badge_key) DO NOTHING;
    END IF;

    RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Automatic daily login streak evaluation and point rewarding
CREATE OR REPLACE FUNCTION public.handle_daily_login_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_last_login DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
    v_points_reward CONSTANT INTEGER := 10; -- +10 Bloom Points for streak logins
BEGIN
    -- Extract current gamification stats
    SELECT last_login_date, current_streak, longest_streak
    INTO v_last_login, v_current_streak, v_longest_streak
    FROM public.user_progress
    WHERE user_id = NEW.id;

    -- Skip calculations if user progress row is not provisioned yet
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    IF v_last_login = CURRENT_DATE THEN
        -- Already logged in today, do not alter streak or award points
        RETURN NEW;
    ELSIF v_last_login = (CURRENT_DATE - 1) THEN
        -- Logged in yesterday: increment active streak count
        v_current_streak := v_current_streak + 1;
        v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
        
        -- Update stats
        UPDATE public.user_progress
        SET current_streak = v_current_streak,
            longest_streak = v_longest_streak,
            last_login_date = CURRENT_DATE
        WHERE user_id = NEW.id;

        -- Award points for streak loyalty
        PERFORM public.award_points_secure(NEW.id, v_points_reward, 'streak_login_yesterday');

        -- Badge Unlock: Week Loyalty (7 days streak)
        IF v_current_streak >= 7 THEN
            INSERT INTO public.badges (user_id, badge_key)
            VALUES (NEW.id, 'loyalty_streak_7')
            ON CONFLICT (user_id, badge_key) DO NOTHING;
        END IF;

    ELSE
        -- Logged in earlier than yesterday: reset active streak to 1
        v_current_streak := 1;

        -- Update stats
        UPDATE public.user_progress
        SET current_streak = v_current_streak,
            last_login_date = CURRENT_DATE
        WHERE user_id = NEW.id;

        -- Award points for new active login session
        PERFORM public.award_points_secure(NEW.id, v_points_reward, 'streak_login_reset');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically audit streaks on user profile updates
CREATE OR REPLACE TRIGGER tr_on_user_login_streak_audit
    AFTER UPDATE OF updated_at ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_daily_login_streak();
