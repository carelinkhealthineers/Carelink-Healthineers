
-- CARELINK HEALTHINEERS - MASTER DATABASE SCHEMA
-- Target Environment: Supabase / PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. SYSTEM CONFIGURATION
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED FOOTER CONTACT SETTINGS
INSERT INTO settings (key, value, category, description)
VALUES 
('footer_address', 'Technical District 01, Innovation Drive, Dubai, UAE', 'footer', 'Physical headquarters address displayed in the global footer.'),
('footer_phone', '+971 4 888 0000', 'footer', 'Primary technical support contact number.'),
('footer_email', 'nexus@carelink.global', 'footer', 'Central command email for inquiries.')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 2. CLINICAL DIVISIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    count_label TEXT,
    hero_gradient TEXT DEFAULT 'from-blue-600 to-indigo-700',
    icon_name TEXT DEFAULT 'Activity',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. PRODUCT ARCHITECTURE
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model_number TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    long_description TEXT,
    main_image TEXT DEFAULT 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    image_gallery TEXT[] DEFAULT '{}',
    category_tag TEXT,
    technical_specs JSONB DEFAULT '{}',
    brochure_url TEXT,
    video_url TEXT,
    warranty_info TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MANDATORY COLUMN SYNC (Fixes Schema Mismatches automatically)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brochure_url') THEN
        ALTER TABLE products ADD COLUMN brochure_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='technical_specs') THEN
        ALTER TABLE products ADD COLUMN technical_specs JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_gallery') THEN
        ALTER TABLE products ADD COLUMN image_gallery TEXT[] DEFAULT '{}';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS product_parts (
    id PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0
);

-- ==========================================
-- 4. INQUIRY FLOW
-- ==========================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. SECURITY (RLS)
-- ==========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Full Access" ON products;
CREATE POLICY "Public Full Access" ON products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Submit" ON inquiries;
CREATE POLICY "Public Submit" ON inquiries FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
