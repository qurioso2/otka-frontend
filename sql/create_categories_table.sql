-- Creare tabel categories pentru sistem categorii produse

-- Tabel categories
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories(sort_order);

-- RLS Policies pentru categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy: Public poate citi categoriile active
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories"
ON public.categories
FOR SELECT
USING (active = true);

-- Policy: Admin poate vedea toate categoriile
DROP POLICY IF EXISTS "Admin read all categories" ON public.categories;
CREATE POLICY "Admin read all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Policy: Admin poate crea categorii
DROP POLICY IF EXISTS "Admin insert categories" ON public.categories;
CREATE POLICY "Admin insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Policy: Admin poate actualiza categorii
DROP POLICY IF EXISTS "Admin update categories" ON public.categories;
CREATE POLICY "Admin update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
)
WITH CHECK (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Policy: Admin poate șterge categorii
DROP POLICY IF EXISTS "Admin delete categories" ON public.categories;
CREATE POLICY "Admin delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Inserare categorii inițiale comune
INSERT INTO public.categories (name, slug, description, sort_order, active) VALUES
  ('Mese', 'mese', 'Mese diverse pentru dining și living', 1, true),
  ('Mese Birou', 'mese-birou', 'Mese pentru birou și lucru', 2, true),
  ('Scaune', 'scaune', 'Scaune dining și diverse', 3, true),
  ('Fotolii', 'fotolii', 'Fotolii pentru relaxare', 4, true),
  ('Canapele', 'canapele', 'Canapele pentru living', 5, true),
  ('Dulapuri', 'dulapuri', 'Dulapuri și spații de depozitare', 6, true),
  ('Paturi', 'paturi', 'Paturi pentru dormitor', 7, true),
  ('Comode', 'comode', 'Comode pentru dormitor și living', 8, true),
  ('Biblioteci', 'biblioteci', 'Biblioteci și rafturi', 9, true),
  ('Diverse', 'diverse', 'Alte produse', 99, true)
ON CONFLICT (slug) DO NOTHING;

-- Actualizare automată updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Verificare
SELECT id, name, slug, active, sort_order 
FROM public.categories 
ORDER BY sort_order ASC;
