-- SISTEM COMPLET MANAGEMENT COMENZI PARTENERI - VERSIUNE SAFE
-- Rulați după supabase_master_setup.sql
-- Această versiune include cleanup pentru a evita conflictele

-- 0) CLEANUP - Eliminăm obiectele existente pentru a evita conflictele
DROP POLICY IF EXISTS "Partners can view their accessible resources" ON public.partner_resources;
DROP POLICY IF EXISTS "Admins can manage all resources" ON public.partner_resources;
DROP POLICY IF EXISTS "Partners can view their own orders" ON public.partner_orders;
DROP POLICY IF EXISTS "Partners can create orders" ON public.partner_orders;
DROP POLICY IF EXISTS "Partners can update their draft orders" ON public.partner_orders;
DROP POLICY IF EXISTS "Partners can view their order items" ON public.partner_order_items;
DROP POLICY IF EXISTS "Partners can manage items for their draft orders" ON public.partner_order_items;

DROP TRIGGER IF EXISTS trigger_set_order_number ON public.partner_orders;
DROP FUNCTION IF EXISTS generate_order_number();
DROP FUNCTION IF EXISTS set_order_number();

DROP VIEW IF EXISTS public.partner_orders_summary;

-- 1) Tabel pentru documente și resurse parteneri (PDF-uri, cataloage, poze)
CREATE TABLE IF NOT EXISTS public.partner_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  description text,
  file_type varchar NOT NULL, -- 'price_list', 'catalog', 'images', 'materials'
  file_url varchar NOT NULL,
  file_size integer,
  mime_type varchar,
  visible boolean DEFAULT true,
  partner_access boolean DEFAULT true, -- dacă partenerii au acces
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Tabel pentru comenzile partenerilor
CREATE TABLE IF NOT EXISTS public.partner_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number varchar UNIQUE NOT NULL, -- generat automat PO-YYYY-XXXXX
  partner_email varchar NOT NULL,
  status varchar DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'approved', 
    'confirmed_signed', 'proforma_generated', 'paid', 
    'in_production', 'shipped', 'delivered', 'cancelled'
  )),
  
  -- Timestampuri pentru tracking
  created_at timestamptz DEFAULT now(), -- data înregistrare comandă
  submitted_at timestamptz, -- data trimitere pentru review
  reviewed_at timestamptz, -- data verificare manuală
  approved_at timestamptz, -- data aprobare
  confirmation_signed_at timestamptz, -- data încărcare confirmare semnată
  proforma_generated_at timestamptz, -- data generare proformă
  paid_at timestamptz, -- data achitare proformă
  shipped_at timestamptz, -- data livrare/trimitere marfă
  delivery_estimated_date timestamptz, -- termen estimat livrare
  delivered_at timestamptz, -- data livrare efectivă
  
  -- Documente asociate
  confirmation_document_url varchar, -- link către confirmarea semnată
  proforma_url varchar, -- link către proforma generată
  
  -- Totals
  total_net numeric DEFAULT 0,
  total_vat numeric DEFAULT 0,
  total_gross numeric DEFAULT 0,
  
  -- Notes
  admin_notes text,
  partner_notes text,
  
  -- Constraints
  FOREIGN KEY (partner_email) REFERENCES public.users(email)
);

-- 3) Tabel pentru items din comenzi
CREATE TABLE IF NOT EXISTS public.partner_order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.partner_orders(id) ON DELETE CASCADE,
  
  -- Datele introduse de partener
  row_number integer NOT NULL, -- nr. crt
  manufacturer_name varchar NOT NULL, -- nume producător
  product_code varchar NOT NULL, -- cod produs (alfanumeric)
  quantity integer NOT NULL DEFAULT 1,
  finish_code varchar, -- finisaj (cod alfanumeric)
  partner_price numeric, -- preț introdus manual de partener (opțional)
  
  -- Datele verificate/completate de admin
  verified_price numeric, -- preț verificat de admin
  unit_net numeric, -- preț net unitar final
  unit_vat numeric, -- TVA pe unitate
  unit_gross numeric, -- preț brut unitar
  total_net numeric, -- total net pentru item
  total_vat numeric, -- total TVA pentru item
  total_gross numeric, -- total brut pentru item
  
  -- Notes
  admin_notes text,
  
  created_at timestamptz DEFAULT now()
);

-- 4) Index pentru performanță
CREATE INDEX IF NOT EXISTS idx_partner_orders_email ON public.partner_orders(partner_email);
CREATE INDEX IF NOT EXISTS idx_partner_orders_status ON public.partner_orders(status);
CREATE INDEX IF NOT EXISTS idx_partner_orders_created ON public.partner_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_partner_order_items_order ON public.partner_order_items(order_id);

-- 5) RLS (Row Level Security)
ALTER TABLE public.partner_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies pentru partner_resources
CREATE POLICY "Partners can view their accessible resources" ON public.partner_resources
  FOR SELECT TO authenticated
  USING (partner_access = true AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = auth.jwt() ->> 'email' 
    AND role IN ('partner', 'admin')
  ));

CREATE POLICY "Admins can manage all resources" ON public.partner_resources
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = auth.jwt() ->> 'email' 
    AND role = 'admin'
  ));

-- RLS Policies pentru partner_orders
CREATE POLICY "Partners can view their own orders" ON public.partner_orders
  FOR SELECT TO authenticated
  USING (
    partner_email = auth.jwt() ->> 'email' OR
    EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'admin')
  );

CREATE POLICY "Partners can create orders" ON public.partner_orders
  FOR INSERT TO authenticated
  WITH CHECK (
    partner_email = auth.jwt() ->> 'email' AND
    EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'partner')
  );

CREATE POLICY "Partners can update their draft orders" ON public.partner_orders
  FOR UPDATE TO authenticated
  USING (
    (partner_email = auth.jwt() ->> 'email' AND status = 'draft') OR
    EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'admin')
  );

-- RLS Policies pentru partner_order_items
CREATE POLICY "Partners can view their order items" ON public.partner_order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partner_orders po
    WHERE po.id = order_id 
    AND (po.partner_email = auth.jwt() ->> 'email' OR
         EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'admin'))
  ));

CREATE POLICY "Partners can manage items for their draft orders" ON public.partner_order_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partner_orders po
    WHERE po.id = order_id 
    AND ((po.partner_email = auth.jwt() ->> 'email' AND po.status = 'draft') OR
         EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'admin'))
  ));

-- 6) Funcție pentru generarea numărului de comandă
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS varchar AS $$
DECLARE
  year_str varchar(4);
  sequence_num integer;
  order_num varchar(50);
BEGIN
  year_str := EXTRACT(YEAR FROM NOW())::varchar;
  
  -- Găsește următorul număr în secvență pentru anul curent
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 'PO-' || year_str || '-(.*)') AS integer)
  ), 0) + 1
  INTO sequence_num
  FROM public.partner_orders
  WHERE order_number LIKE 'PO-' || year_str || '-%';
  
  order_num := 'PO-' || year_str || '-' || LPAD(sequence_num::varchar, 5, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- 7) Trigger pentru auto-generare număr comandă
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.partner_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- 8) Seed date pentru resurse demo
INSERT INTO public.partner_resources (name, description, file_type, file_url, mime_type, visible, partner_access)
VALUES
  ('Lista Prețuri Generale Q1 2025', 'Lista de prețuri actualizată pentru primul trimestru 2025', 'price_list', 'https://cdn.otka.ro/resources/price-list-q1-2025.pdf', 'application/pdf', true, true),
  ('Catalog Produse Apple', 'Catalog complet produse Apple disponibile', 'catalog', 'https://cdn.otka.ro/resources/catalog-apple-2025.pdf', 'application/pdf', true, true),
  ('Catalog Produse Samsung', 'Catalog complet produse Samsung disponibile', 'catalog', 'https://cdn.otka.ro/resources/catalog-samsung-2025.pdf', 'application/pdf', true, true),
  ('Imagini Produse - Set 1', 'Colecție imagini produse pentru materiale marketing', 'images', 'https://cdn.otka.ro/resources/product-images-set1.zip', 'application/zip', true, true),
  ('Materiale Promoționale', 'Materiale pentru promovarea produselor', 'materials', 'https://cdn.otka.ro/resources/promotional-materials.zip', 'application/zip', true, true)
ON CONFLICT DO NOTHING;

-- 9) View pentru rapoarte comenzi parteneri
CREATE OR REPLACE VIEW public.partner_orders_summary AS
SELECT 
  po.id,
  po.order_number,
  po.partner_email,
  u.company_name,
  u.contact_name,
  po.status,
  po.created_at,
  po.submitted_at,
  po.approved_at,
  po.paid_at,
  po.delivered_at,
  po.delivery_estimated_date,
  po.total_gross,
  COUNT(poi.id) as items_count
FROM public.partner_orders po
LEFT JOIN public.users u ON po.partner_email = u.email
LEFT JOIN public.partner_order_items poi ON po.id = poi.order_id
GROUP BY po.id, u.company_name, u.contact_name;

-- END PARTNER ORDERS SYSTEM SAFE VERSION