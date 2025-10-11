-- Creare tabel brands pentru producători/branduri

-- Tabel brands
CREATE TABLE IF NOT EXISTS public.brands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(active);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_sort ON public.brands(sort_order);

-- RLS Policies pentru brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Policy: Public poate citi brandurile active
DROP POLICY IF EXISTS "Public read active brands" ON public.brands;
CREATE POLICY "Public read active brands"
ON public.brands
FOR SELECT
USING (active = true);

-- Policy: Admin poate vedea toate brandurile
DROP POLICY IF EXISTS "Admin read all brands" ON public.brands;
CREATE POLICY "Admin read all brands"
ON public.brands
FOR SELECT
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Policy: Admin poate crea branduri
DROP POLICY IF EXISTS "Admin insert brands" ON public.brands;
CREATE POLICY "Admin insert brands"
ON public.brands
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Policy: Admin poate actualiza branduri
DROP POLICY IF EXISTS "Admin update brands" ON public.brands;
CREATE POLICY "Admin update brands"
ON public.brands
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
)
WITH CHECK (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Policy: Admin poate șterge branduri
DROP POLICY IF EXISTS "Admin delete brands" ON public.brands;
CREATE POLICY "Admin delete brands"
ON public.brands
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Inserare branduri inițiale comune
INSERT INTO public.brands (name, slug, description, sort_order, active) VALUES
  ('Pianca', 'pianca', 'Mobilier italian de lux', 1, true),
  ('Lago', 'lago', 'Design italian contemporan', 2, true),
  ('Molteni&C', 'molteni-c', 'Mobilier italian premium', 3, true),
  ('B&B Italia', 'bb-italia', 'Design iconic italian', 4, true),
  ('Cassina', 'cassina', 'Mobilier de design', 5, true),
  ('Flexform', 'flexform', 'Canapele și fotolii de lux', 6, true),
  ('Poltrona Frau', 'poltrona-frau', 'Mobilier din piele', 7, true),
  ('Minotti', 'minotti', 'Design contemporan italian', 8, true),
  ('Zanotta', 'zanotta', 'Mobilier iconic', 9, true),
  ('Diverse', 'diverse', 'Alte branduri', 99, true)
ON CONFLICT (slug) DO NOTHING;

-- Actualizare automată updated_at
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS brands_updated_at ON public.brands;
CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brands_updated_at();

-- Verificare
SELECT id, name, slug, active, sort_order 
FROM public.brands 
ORDER BY sort_order ASC;
