-- =====================================================
-- OTKA Proforma Invoice System - Complete Database Schema
-- =====================================================
-- Description: Complete schema for proforma invoice management
-- with flexible VAT rates, company settings, and email tracking
-- =====================================================

-- =====================================================
-- 1. TAX RATES TABLE
-- =====================================================
-- Stores all available VAT rates (21%, 19%, 9%, 5%, 0%)
-- Allows easy updates when legislation changes

CREATE TABLE IF NOT EXISTS public.tax_rates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE, -- Ex: "Standard 2025", "Redusă", "Scutit"
  rate NUMERIC(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100), -- Procent TVA (ex: 21.00)
  active BOOLEAN NOT NULL DEFAULT true, -- Activ/Inactiv pentru selectare
  is_default BOOLEAN NOT NULL DEFAULT false, -- Cotă implicită pentru produse noi
  description TEXT, -- Detalii despre când se aplică această cotă
  effective_from DATE, -- Dată de la care e valabilă (pentru istoric)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON public.tax_rates(active);
CREATE INDEX IF NOT EXISTS idx_tax_rates_default ON public.tax_rates(is_default) WHERE is_default = true;

-- Trigger pentru updated_at
CREATE OR REPLACE FUNCTION update_tax_rates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tax_rates_updated_at ON public.tax_rates;
CREATE TRIGGER tax_rates_updated_at
  BEFORE UPDATE ON public.tax_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_tax_rates_timestamp();

-- Date inițiale: 5 cote TVA standard România
INSERT INTO public.tax_rates (name, rate, active, is_default, description, effective_from, sort_order) VALUES
  ('Standard 2025', 21.00, true, true, 'Cotă TVA standard aplicabilă din August 2025', '2025-08-01', 1),
  ('Standard 2024', 19.00, false, false, 'Cotă TVA standard aplicabilă până în 2025', '2024-01-01', 2),
  ('Redusă', 9.00, true, false, 'Cotă redusă pentru alimente, servicii hoteliere', '2024-01-01', 3),
  ('Super-redusă', 5.00, true, false, 'Cotă super-redusă pentru anumite produse alimentare de bază', '2023-01-01', 4),
  ('Scutit (export, ambalaje)', 0.00, true, false, 'Produse scutite de TVA: ambalaje, export', '2024-01-01', 5)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. UPDATE PRODUCTS TABLE - ADD TAX_RATE_ID
-- =====================================================
-- Înlocuim vat_rate (numeric) cu tax_rate_id (FK către tax_rates)

-- Verificăm dacă coloana tax_rate_id există deja
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'tax_rate_id'
  ) THEN
    -- Adăugăm coloana tax_rate_id
    ALTER TABLE public.products ADD COLUMN tax_rate_id BIGINT;
    
    -- Setăm FK constraint
    ALTER TABLE public.products 
      ADD CONSTRAINT fk_products_tax_rate 
      FOREIGN KEY (tax_rate_id) 
      REFERENCES public.tax_rates(id) 
      ON DELETE SET NULL;
    
    -- Migrăm datele existente: dacă vat_rate = 19 → Standard 2024, altfel → Standard 2025
    UPDATE public.products 
    SET tax_rate_id = (
      SELECT id FROM public.tax_rates 
      WHERE name = CASE 
        WHEN products.vat_rate = 19 THEN 'Standard 2024'
        WHEN products.vat_rate = 9 THEN 'Redusă'
        WHEN products.vat_rate = 5 THEN 'Super-redusă'
        WHEN products.vat_rate = 0 THEN 'Scutit (export, ambalaje)'
        ELSE 'Standard 2025'
      END
      LIMIT 1
    )
    WHERE tax_rate_id IS NULL;
    
    -- Setăm default pentru produse noi (21%)
    ALTER TABLE public.products 
      ALTER COLUMN tax_rate_id SET DEFAULT (
        SELECT id FROM public.tax_rates WHERE is_default = true LIMIT 1
      );
    
    RAISE NOTICE 'Coloana tax_rate_id adăugată cu succes în products';
  ELSE
    RAISE NOTICE 'Coloana tax_rate_id există deja în products';
  END IF;
END $$;

-- Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_products_tax_rate ON public.products(tax_rate_id);

-- =====================================================
-- 3. COMPANY SETTINGS TABLE
-- =====================================================
-- Stochează date firmă pentru proforme (CUI, IBAN, logo, etc.)

CREATE TABLE IF NOT EXISTS public.company_settings (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL DEFAULT 'OTKA',
  cui VARCHAR(50), -- CUI/CIF
  reg_com VARCHAR(100), -- Registrul Comerțului
  address TEXT,
  city VARCHAR(100),
  county VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'România',
  phone VARCHAR(50),
  email VARCHAR(100),
  website VARCHAR(200),
  
  -- Date bancare
  iban_ron VARCHAR(50), -- IBAN pentru RON
  iban_eur VARCHAR(50), -- IBAN pentru EUR
  bank_name VARCHAR(200),
  
  -- Logo și template
  logo_url TEXT, -- URL logo pentru proforme
  logo_width INTEGER DEFAULT 150, -- Lățime logo în PDF (px)
  logo_height INTEGER DEFAULT 60, -- Înălțime logo în PDF (px)
  
  -- Serie proforme
  proforma_series VARCHAR(20) DEFAULT 'OTK', -- Serie proforme (ex: OTK)
  proforma_counter INTEGER DEFAULT 0, -- Counter pentru numerotare automată
  
  -- Email templates
  email_subject_template TEXT DEFAULT 'Proforma #{number} - {company_name}',
  email_body_template TEXT DEFAULT 'Bună ziua,\n\nVă transmitem în atașament factura proformă #{number}.\n\nVă mulțumim,\n{company_name}',
  
  -- Termeni și condiții pentru proforme
  terms_and_conditions TEXT DEFAULT 'Plata se va efectua în termen de 15 zile de la emiterea proformei.\nProdusele rămân proprietatea vânzătorului până la încasarea integrală a sumei.',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger pentru updated_at
CREATE OR REPLACE FUNCTION update_company_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS company_settings_updated_at ON public.company_settings;
CREATE TRIGGER company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_company_settings_timestamp();

-- Inserăm setări default (doar dacă tabelul e gol)
INSERT INTO public.company_settings (
  company_name, 
  cui, 
  reg_com, 
  address, 
  city, 
  county, 
  country, 
  phone, 
  email, 
  website
) 
SELECT 
  'OTKA', 
  'RO12345678', 
  'J40/1234/2020', 
  'Str. Exemplu Nr. 1', 
  'București', 
  'București', 
  'România', 
  '+40 123 456 789', 
  'salut@otka.ro', 
  'https://otka.ro'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings LIMIT 1);

-- =====================================================
-- 4. PROFORME TABLE
-- =====================================================
-- Tabel principal pentru facturile proformă

CREATE TABLE IF NOT EXISTS public.proforme (
  id BIGSERIAL PRIMARY KEY,
  
  -- Serie și număr
  series VARCHAR(20) NOT NULL DEFAULT 'OTK',
  number INTEGER NOT NULL, -- Număr incremental
  full_number VARCHAR(50) GENERATED ALWAYS AS (series || '-' || LPAD(number::TEXT, 5, '0')) STORED, -- OTK-00001
  
  -- Date emitere
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE, -- Scadență (opțional)
  
  -- Client
  client_type VARCHAR(2) NOT NULL CHECK (client_type IN ('PF', 'PJ')), -- Persoană Fizică / Juridică
  client_name VARCHAR(200) NOT NULL, -- Nume complet (PF) sau Nume firmă (PJ)
  client_cui VARCHAR(50), -- CUI (doar PJ)
  client_reg_com VARCHAR(100), -- Reg. Com. (doar PJ)
  client_address TEXT,
  client_city VARCHAR(100),
  client_county VARCHAR(100),
  client_country VARCHAR(100) DEFAULT 'România',
  client_phone VARCHAR(50),
  client_email VARCHAR(100),
  
  -- Sumare financiare
  currency VARCHAR(3) NOT NULL DEFAULT 'RON' CHECK (currency IN ('RON', 'EUR')),
  subtotal_no_vat NUMERIC(12,2) NOT NULL DEFAULT 0, -- Total fără TVA
  total_vat NUMERIC(12,2) NOT NULL DEFAULT 0, -- Total TVA
  total_with_vat NUMERIC(12,2) NOT NULL DEFAULT 0, -- Total cu TVA
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  
  -- Observații
  notes TEXT, -- Observații interne
  client_notes TEXT, -- Observații pentru client (apar pe PDF)
  
  -- Tracking
  created_by_user_id BIGINT, -- ID user care a creat (FK către users - opțional)
  confirmed_at TIMESTAMPTZ, -- Când a fost confirmată încasarea
  confirmed_by_user_id BIGINT, -- Cine a confirmat
  
  -- Email tracking
  email_sent_at TIMESTAMPTZ, -- Când a fost trimis email-ul
  email_sent_to VARCHAR(100), -- La ce adresă
  
  -- PDF
  pdf_url TEXT, -- URL către PDF generat (stocat în R2/Supabase Storage)
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: număr unic per serie
  UNIQUE(series, number)
);

-- Indexes pentru performanță și căutare
CREATE INDEX IF NOT EXISTS idx_proforme_full_number ON public.proforme(full_number);
CREATE INDEX IF NOT EXISTS idx_proforme_status ON public.proforme(status);
CREATE INDEX IF NOT EXISTS idx_proforme_issue_date ON public.proforme(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_proforme_client_name ON public.proforme(client_name);
CREATE INDEX IF NOT EXISTS idx_proforme_client_email ON public.proforme(client_email);

-- Trigger pentru updated_at
CREATE OR REPLACE FUNCTION update_proforme_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS proforme_updated_at ON public.proforme;
CREATE TRIGGER proforme_updated_at
  BEFORE UPDATE ON public.proforme
  FOR EACH ROW
  EXECUTE FUNCTION update_proforme_timestamp();

-- =====================================================
-- 5. PROFORMA_ITEMS TABLE
-- =====================================================
-- Produsele din fiecare proformă (cu cotă TVA specifică)

CREATE TABLE IF NOT EXISTS public.proforma_items (
  id BIGSERIAL PRIMARY KEY,
  proforma_id BIGINT NOT NULL REFERENCES public.proforme(id) ON DELETE CASCADE,
  
  -- Referință produs (opțional - poate fi și produs custom)
  product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  
  -- Detalii produs (snapshot - rămân fixe chiar dacă produsul se modifică)
  sku VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Preț și cantitate
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL, -- Preț unitar FĂRĂ TVA
  
  -- TVA
  tax_rate_id BIGINT NOT NULL REFERENCES public.tax_rates(id) ON DELETE RESTRICT,
  tax_rate_value NUMERIC(5,2) NOT NULL, -- Snapshot procentul TVA (ex: 21.00) - rămâne fix
  
  -- Calcule (pot fi GENERATED sau actualizate la INSERT/UPDATE)
  subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED, -- Total fără TVA
  vat_amount NUMERIC(12,2) GENERATED ALWAYS AS (ROUND((quantity * unit_price * tax_rate_value / 100)::numeric, 2)) STORED, -- Suma TVA
  total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price + ROUND((quantity * unit_price * tax_rate_value / 100)::numeric, 2)) STORED, -- Total cu TVA
  
  sort_order INTEGER DEFAULT 0, -- Ordine afișare în proformă
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proforma_items_proforma ON public.proforma_items(proforma_id);
CREATE INDEX IF NOT EXISTS idx_proforma_items_product ON public.proforma_items(product_id);
CREATE INDEX IF NOT EXISTS idx_proforma_items_tax_rate ON public.proforma_items(tax_rate_id);

-- =====================================================
-- 6. TRIGGER: Auto-increment Proforma Number
-- =====================================================
-- Când se creează o proformă nouă, se ia automat următorul număr

CREATE OR REPLACE FUNCTION auto_increment_proforma_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  -- Dacă numărul nu e setat manual
  IF NEW.number IS NULL THEN
    -- Luăm counter-ul din company_settings și îl incrementăm
    UPDATE public.company_settings
    SET proforma_counter = proforma_counter + 1
    RETURNING proforma_counter INTO next_number;
    
    NEW.number = next_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_increment_proforma ON public.proforme;
CREATE TRIGGER trigger_auto_increment_proforma
  BEFORE INSERT ON public.proforme
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_proforma_number();

-- =====================================================
-- 7. TRIGGER: Update Proforma Totals
-- =====================================================
-- Când se modifică items, recalculăm totalurile proformei

CREATE OR REPLACE FUNCTION update_proforma_totals()
RETURNS TRIGGER AS $$
DECLARE
  proforma_record RECORD;
BEGIN
  -- Găsim proforma afectată
  IF TG_OP = 'DELETE' THEN
    SELECT id INTO proforma_record FROM public.proforme WHERE id = OLD.proforma_id;
  ELSE
    SELECT id INTO proforma_record FROM public.proforme WHERE id = NEW.proforma_id;
  END IF;
  
  -- Recalculăm totalurile
  UPDATE public.proforme
  SET 
    subtotal_no_vat = COALESCE((
      SELECT SUM(subtotal) FROM public.proforma_items 
      WHERE proforma_id = proforma_record.id
    ), 0),
    total_vat = COALESCE((
      SELECT SUM(vat_amount) FROM public.proforma_items 
      WHERE proforma_id = proforma_record.id
    ), 0),
    total_with_vat = COALESCE((
      SELECT SUM(total) FROM public.proforma_items 
      WHERE proforma_id = proforma_record.id
    ), 0)
  WHERE id = proforma_record.id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_proforma_totals_insert ON public.proforma_items;
CREATE TRIGGER trigger_update_proforma_totals_insert
  AFTER INSERT ON public.proforma_items
  FOR EACH ROW
  EXECUTE FUNCTION update_proforma_totals();

DROP TRIGGER IF EXISTS trigger_update_proforma_totals_update ON public.proforma_items;
CREATE TRIGGER trigger_update_proforma_totals_update
  AFTER UPDATE ON public.proforma_items
  FOR EACH ROW
  EXECUTE FUNCTION update_proforma_totals();

DROP TRIGGER IF EXISTS trigger_update_proforma_totals_delete ON public.proforma_items;
CREATE TRIGGER trigger_update_proforma_totals_delete
  AFTER DELETE ON public.proforma_items
  FOR EACH ROW
  EXECUTE FUNCTION update_proforma_totals();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS pe toate tabelele noi
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_items ENABLE ROW LEVEL SECURITY;

-- Policies pentru tax_rates
CREATE POLICY "Public can view active tax rates"
  ON public.tax_rates FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Authenticated can view all tax rates"
  ON public.tax_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can manage tax rates"
  ON public.tax_rates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies pentru company_settings
CREATE POLICY "Authenticated can view company settings"
  ON public.company_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update company settings"
  ON public.company_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies pentru proforme
CREATE POLICY "Authenticated can view all proforme"
  ON public.proforme FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can manage proforme"
  ON public.proforme FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies pentru proforma_items
CREATE POLICY "Authenticated can view proforma items"
  ON public.proforma_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can manage proforma items"
  ON public.proforma_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 9. VIEWS - Facilități de raportare
-- =====================================================

-- View pentru statistici proforme
CREATE OR REPLACE VIEW public.proforma_stats AS
SELECT
  COUNT(*) as total_proforme,
  COUNT(*) FILTER (WHERE status = 'paid') as total_paid,
  COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
  COUNT(*) FILTER (WHERE status = 'cancelled') as total_cancelled,
  SUM(total_with_vat) FILTER (WHERE status = 'paid') as suma_incasata,
  SUM(total_with_vat) FILTER (WHERE status = 'pending') as suma_in_asteptare,
  SUM(total_with_vat) as suma_totala,
  currency
FROM public.proforme
GROUP BY currency;

-- View pentru proforme cu detalii complete
CREATE OR REPLACE VIEW public.proforme_complete AS
SELECT 
  p.*,
  COUNT(pi.id) as total_items,
  STRING_AGG(DISTINCT pi.name, ', ') as products_summary
FROM public.proforme p
LEFT JOIN public.proforma_items pi ON p.id = pi.proforma_id
GROUP BY p.id;

-- =====================================================
-- 10. FUNCȚII HELPER
-- =====================================================

-- Funcție pentru a obține următorul număr proformă (fără a-l consuma)
CREATE OR REPLACE FUNCTION get_next_proforma_number()
RETURNS INTEGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT proforma_counter + 1 INTO next_num
  FROM public.company_settings
  LIMIT 1;
  
  RETURN COALESCE(next_num, 1);
END;
$$ LANGUAGE plpgsql;

-- Funcție pentru update masiv tax_rate_id pentru toate produsele
CREATE OR REPLACE FUNCTION update_all_products_tax_rate(
  old_rate_id BIGINT,
  new_rate_id BIGINT
)
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE public.products
  SET tax_rate_id = new_rate_id
  WHERE tax_rate_id = old_rate_id;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEMA CREATION COMPLETE ✅
-- =====================================================
-- 
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify tables created: SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%tax%' OR tablename LIKE '%proforma%' OR tablename LIKE '%company%';
-- 3. Verify data: SELECT * FROM tax_rates;
-- 4. Test triggers: INSERT INTO proforme (client_type, client_name) VALUES ('PF', 'Test Client') RETURNING *;
--
-- =====================================================
