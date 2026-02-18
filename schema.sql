
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SETTINGS TABLE
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DIVISIONS TABLE
CREATE TABLE divisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  hero_gradient TEXT,
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  model_number TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  long_description TEXT,
  main_image TEXT,
  category_tag TEXT, -- e.g., 'Imaging Equipment', 'Surgical Items'
  is_published BOOLEAN DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS and other tables remain as defined in previous iteration...

-- SEED DATA: UPDATED CLINICAL DEPARTMENTS
INSERT INTO divisions (name, slug, hero_gradient, icon_name, order_index) VALUES
('Laboratory / Pathology', 'laboratory-pathology', 'from-blue-600 to-indigo-700', 'Microscope', 1),
('Imaging / Radiology', 'imaging-radiology', 'from-violet-600 to-purple-800', 'Radiation', 2),
('Operation Theatre (OT)', 'surgical-ot', 'from-cyan-600 to-blue-700', 'Scissors', 3),
('ICU / CCU / Emergency', 'critical-care', 'from-rose-600 to-red-800', 'Activity', 4),
('OPD / General Examination', 'opd-examination', 'from-emerald-600 to-teal-800', 'Stethoscope', 5),
('Dialysis Department', 'dialysis', 'from-blue-400 to-indigo-600', 'Waves', 6),
('Dental Department', 'dental', 'from-sky-500 to-blue-600', 'Zap', 7),
('CSSD / Sterilization', 'sterilization', 'from-slate-600 to-zinc-800', 'ShieldCheck', 8),
('Hospital Furniture', 'hospital-furniture', 'from-amber-600 to-orange-700', 'Bed', 9),
('Medical Consumables', 'consumables', 'from-pink-600 to-rose-700', 'Package', 10);
