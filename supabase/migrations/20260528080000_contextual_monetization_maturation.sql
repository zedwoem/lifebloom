-- migration: 20260528080000_contextual_monetization_maturation.sql

-- 1. Safely create or update public.products catalog
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        CREATE TABLE public.products (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY
        );
    END IF;
END
$$;

ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS network TEXT,
    ADD COLUMN IF NOT EXISTS network_product_id TEXT,
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS pillar TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[],
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS base_commission_rate NUMERIC,
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS target_url TEXT,
    ADD COLUMN IF NOT EXISTS priority_score INT DEFAULT 50,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_network_network_product_id_key') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_network_network_product_id_key UNIQUE(network, network_product_id);
    END IF;
END
$$;

-- 2. Optimalisasi Indeksasi Kueri untuk Pencocokan Kecepatan Tinggi
CREATE INDEX IF NOT EXISTS idx_products_pillar ON public.products (pillar) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_priority ON public.products (priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN (tags);

-- 3. Upgrade Tabel Log Klik Afiliasi (affiliate_clicks) untuk Pelacakan Relasional
ALTER TABLE public.affiliate_clicks 
    ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS calculator_slug TEXT,
    ADD COLUMN IF NOT EXISTS sub_id TEXT,
    ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT false;

-- 4. Aktifkan & Buat Aturan Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND policyname = 'Products are publicly viewable'
    ) THEN
        CREATE POLICY "Products are publicly viewable" 
            ON public.products 
            FOR SELECT 
            USING (is_active = true);
    END IF;
END
$$;

-- 5. Automasi Pembaruan Timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_products_updated_at') THEN
        CREATE TRIGGER trigger_products_updated_at
            BEFORE UPDATE ON public.products
            FOR EACH ROW 
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;
