-- Adaugă câmpuri noi la tabelul products

-- 1. Adaugă summary field pentru rezumat scurt
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- 2. Verifică și actualizează brand_id pentru a fi INTEGER cu FK
ALTER TABLE public.products 
ALTER COLUMN brand_id TYPE INTEGER USING brand_id::integer;

-- 3. Adaugă foreign key constraint către brands
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS fk_products_brand;

ALTER TABLE public.products
ADD CONSTRAINT fk_products_brand 
FOREIGN KEY (brand_id) 
REFERENCES public.brands(id) 
ON DELETE SET NULL;

-- 4. Creează index pentru performanță
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);

-- 5. Actualizează view products_public pentru a include summary și brand_id
DROP VIEW IF EXISTS public.products_public;

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

-- Verificare
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('summary', 'brand_id')
ORDER BY column_name;

-- Verificare view
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products_public' 
ORDER BY ordinal_position;
