-- Actualizare view products_public pentru a include description

-- Drop view existent
DROP VIEW IF EXISTS public.products_public;

-- Recreare view cu description inclus
CREATE VIEW public.products_public AS
SELECT 
    id,
    sku,
    name,
    slug,
    description,
    price_public_ttc,
    price_original,
    stock_qty,
    gallery,
    category,
    brand_id,
    created_at
FROM public.products
WHERE active = true;

-- Verificare
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products_public' 
ORDER BY ordinal_position;
