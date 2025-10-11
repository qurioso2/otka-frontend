-- Fix: Adaugă câmpuri noi la tabelul products
-- Rezolvă problema cu view-ul existent

-- 1. DROP VIEW ÎNAINTE de a modifica coloana
DROP VIEW IF EXISTS public.products_public;

-- 2. Adaugă summary field pentru rezumat scurt
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- 3. Verifică dacă brand_id există și modifică tipul (dacă nu e deja INTEGER)
-- Dacă brand_id nu există, o creăm direct ca INTEGER
DO $$ 
BEGIN
    -- Verifică dacă coloana există
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'brand_id'
    ) THEN
        -- Există deja, modifică tipul
        ALTER TABLE public.products 
        ALTER COLUMN brand_id TYPE INTEGER USING brand_id::integer;
    ELSE
        -- Nu există, o creăm
        ALTER TABLE public.products 
        ADD COLUMN brand_id INTEGER;
    END IF;
END $$;

-- 4. Drop constraint dacă există, apoi adaugă-l
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS fk_products_brand;

ALTER TABLE public.products
ADD CONSTRAINT fk_products_brand 
FOREIGN KEY (brand_id) 
REFERENCES public.brands(id) 
ON DELETE SET NULL;

-- 5. Creează index pentru performanță
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

-- 6. RECREĂM VIEW-UL cu toate coloanele necesare
CREATE VIEW public.products_public AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.slug,
    p.description,
    p.summary,
    p.price_public_ttc,
    p.price_original,
    p.stock_qty,
    p.gallery,
    p.category,
    p.brand_id,
    b.name as brand_name
FROM public.products p
LEFT JOIN public.brands b ON p.brand_id = b.id
WHERE p.visible = true;

-- Grant access
GRANT SELECT ON public.products_public TO anon, authenticated;

-- Verificare coloane products
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('summary', 'brand_id', 'category', 'description')
ORDER BY column_name;

-- Verificare view
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products_public' 
ORDER BY ordinal_position;
