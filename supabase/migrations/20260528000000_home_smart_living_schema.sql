-- Migration: 023_home_smart_living_schema
-- Purpose: Deploy Matter, Renovasi, and Utility tables for Home & Smart Living segment with RLS

-- Create smart_home_devices table
CREATE TABLE IF NOT EXISTS public.smart_home_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    is_compatible BOOLEAN NOT NULL,
    checked_at TIMESTAMPTZ DEFAULT now()
);

-- Create renovation_budgets table with strict numeric constraints
CREATE TABLE IF NOT EXISTS public.renovation_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    area_sqm NUMERIC(10,2) NOT NULL CHECK (area_sqm > 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    contingency_buffer NUMERIC(12,2) NOT NULL CHECK (contingency_buffer >= 0),
    total_estimated NUMERIC(12,2) NOT NULL CHECK (total_estimated >= subtotal),
    materials_breakdown JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create utility_logs table for energy tracking
CREATE TABLE IF NOT EXISTS public.utility_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    utility_type TEXT NOT NULL CHECK (utility_type IN ('electricity', 'water', 'gas')),
    consumption_val NUMERIC(10,2) NOT NULL CHECK (consumption_val >= 0),
    cost_amt NUMERIC(10,2) NOT NULL CHECK (cost_amt >= 0),
    billing_period DATE NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, utility_type, billing_period)
);

-- Indexes for lightning-fast retrieval
CREATE INDEX IF NOT EXISTS idx_smart_home_user ON public.smart_home_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_renovations_user ON public.renovation_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_utilities_user_period ON public.utility_logs(user_id, billing_period DESC);

-- Enable RLS Policies
ALTER TABLE public.smart_home_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovation_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utility_logs ENABLE ROW LEVEL SECURITY;

-- Owner-only permissions matching Core Security Standard
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'smart_home_devices' AND policyname = 'Users can manage their own smart home devices'
    ) THEN
        CREATE POLICY "Users can manage their own smart home devices"
            ON public.smart_home_devices FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'renovation_budgets' AND policyname = 'Users can manage their own renovation budgets'
    ) THEN
        CREATE POLICY "Users can manage their own renovation budgets"
            ON public.renovation_budgets FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'utility_logs' AND policyname = 'Users can manage their own utility logs'
    ) THEN
        CREATE POLICY "Users can manage their own utility logs"
            ON public.utility_logs FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;
