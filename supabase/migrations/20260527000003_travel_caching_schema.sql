-- supabase/migrations/20260527000003_travel_caching_schema.sql
-- Description: Schema addition for caching travel metasearch queries (Aviasales v3 + Hotels) and tracking commissions.

-- 1. Table Cache Penerbangan Termurah (Aviasales API v3)
CREATE TABLE IF NOT EXISTS public.travel_flights_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin VARCHAR(3) NOT NULL,            -- Kode IATA (e.g. CGK, DPS, NYC)
    destination VARCHAR(3) NOT NULL,       -- Kode IATA
    price NUMERIC(12,2) NOT NULL,          -- Tarif termurah dalam IDR/USD
    airline VARCHAR(10) NOT NULL,          -- Kode Maskapai (e.g. GA, SQ, AA)
    flight_number VARCHAR(10),             -- Nomor penerbangan v3
    departure_at TIMESTAMPTZ NOT NULL,     -- Waktu Keberangkatan
    return_at TIMESTAMPTZ,                 -- Waktu Kepulangan (Nullable untuk One-Way)
    direct BOOLEAN DEFAULT true,           -- Penerbangan langsung (Senior friendly)
    transfers INT DEFAULT 0,               -- Jumlah transit
    duration INT,                          -- Durasi perjalanan (menit)
    booking_url TEXT NOT NULL,             -- Dynamic Affiliate Link generated server-side
    expires_at TIMESTAMPTZ NOT NULL,       -- TTL expiration (Default: 6 jam dari fetch)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing unik untuk mencegah duplikasi rute & mempercepat query pencarian cache
CREATE UNIQUE INDEX IF NOT EXISTS uq_origin_dest_dates_v3 
ON public.travel_flights_cache (origin, destination, departure_at, direct);

CREATE INDEX IF NOT EXISTS idx_flights_expiry_v3 
ON public.travel_flights_cache (expires_at DESC);

-- Enable RLS
ALTER TABLE public.travel_flights_cache ENABLE ROW LEVEL SECURITY;

-- Policies for travel_flights_cache: Public (anon and authenticated) can select, only service_role (system) can write/manage.
CREATE POLICY "Allow public select on travel_flights_cache"
    ON public.travel_flights_cache FOR SELECT
    USING (true);

-- 2. Tabel Cache Akomodasi Hotel Termurah (Senior Accessible)
CREATE TABLE IF NOT EXISTS public.travel_hotels_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id INT NOT NULL,           
    destination_name TEXT NOT NULL,        
    hotel_id VARCHAR(50) NOT NULL,         
    hotel_name TEXT NOT NULL,
    price_min NUMERIC(12,2) NOT NULL,      
    stars INT CHECK (stars BETWEEN 1 AND 5),
    rating NUMERIC(3,1),                   
    has_elevator BOOLEAN DEFAULT false,    -- Akses lift (Senior friendly)
    wheelchair_accessible BOOLEAN DEFAULT false, -- Akses kursi roda
    booking_url TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,       -- TTL expiration (Default: 24 jam)
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_hotel_dest_v3 
ON public.travel_hotels_cache (hotel_id, expires_at);

-- Enable RLS
ALTER TABLE public.travel_hotels_cache ENABLE ROW LEVEL SECURITY;

-- Policies for travel_hotels_cache: Public can select, system can write.
CREATE POLICY "Allow public select on travel_hotels_cache"
    ON public.travel_hotels_cache FOR SELECT
    USING (true);

-- 3. Tabel Pelacakan Komisi & Booking Terkonfirmasi (Reporting API Sync)
CREATE TABLE IF NOT EXISTS public.travel_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    click_id UUID REFERENCES public.affiliate_clicks(id) ON DELETE SET NULL,
    booking_id TEXT UNIQUE NOT NULL,       -- ID Transaksi dari Travelpayouts
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'rejected')),
    price_total NUMERIC(12,2) NOT NULL,    -- Total nilai booking user
    commission NUMERIC(12,2) NOT NULL,     -- Komisi yang diperoleh LifeBloom
    currency VARCHAR(3) DEFAULT 'USD',
    booked_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.travel_commissions (status);

-- Enable RLS
ALTER TABLE public.travel_commissions ENABLE ROW LEVEL SECURITY;

-- Policies for travel_commissions: Admin can select/write, authenticated users can select their own clicks if needed.
-- But for simplicity, we allow general select to authenticated users for audit, writes only by system.
CREATE POLICY "Allow authenticated select on travel_commissions"
    ON public.travel_commissions FOR SELECT
    TO authenticated
    USING (true);

-- 4. Pembersihan Cache Otomatis (Cron Policy/Function)
CREATE OR REPLACE FUNCTION public.purge_expired_travel_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.travel_flights_cache WHERE expires_at < now();
    DELETE FROM public.travel_hotels_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
