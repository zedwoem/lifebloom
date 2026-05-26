-- Migration 015: Support Documents, Website Settings, and RSS Blacklist

-- 1. Create support_documents table (Using TEXT for Markdown/HTML instead of JSONB)
CREATE TABLE IF NOT EXISTS public.support_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for support_documents
ALTER TABLE public.support_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view support documents" 
ON public.support_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage support documents" 
ON public.support_documents 
FOR ALL 
USING (public.is_admin());

-- Insert initial static support documents
INSERT INTO public.support_documents (slug, title, content) VALUES
('terms', 'Syarat dan Ketentuan', '# Syarat dan Ketentuan\n\nSelamat datang di LifeBloom Hub. Dengan menggunakan platform ini, Anda menyetujui seluruh ketentuan yang berlaku. Harap baca secara teliti.'),
('privacy', 'Kebijakan Privasi', '# Kebijakan Privasi\n\nKami sangat menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.'),
('knowledge', 'Knowledge Base', '# Pusat Pengetahuan\n\nTemukan berbagai informasi dan panduan untuk menggunakan LifeBloom Hub secara maksimal.')
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title, content = EXCLUDED.content;


-- 2. Create website_settings table
CREATE TABLE IF NOT EXISTS public.website_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for website_settings
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view website settings" 
ON public.website_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage website settings" 
ON public.website_settings 
FOR ALL 
USING (public.is_admin());

-- Insert initial global settings
INSERT INTO public.website_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Enable or disable website maintenance mode'),
('site_name', 'LifeBloom Hub', 'The official name of the website'),
('theme_accent_color', '#0f766e', 'Primary accent color for the platform UI'),
('api_health_threshold', '1000', 'Threshold in ms before warning about API latency')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, description = EXCLUDED.description;


-- 3. Add is_blacklisted to aggregated_content (Soft delete)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'aggregated_content' 
        AND column_name = 'is_blacklisted'
    ) THEN
        ALTER TABLE public.aggregated_content ADD COLUMN is_blacklisted BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
