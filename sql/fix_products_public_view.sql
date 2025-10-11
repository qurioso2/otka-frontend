-- Fix products_public view - elimină created_at care nu există în tabelul products
-- Actualizare view products_public pentru a include description și price_original

-- Drop view existent
DROP VIEW IF EXISTS public.products_public;

-- Recreare view cu coloanele corecte (fără created_at)
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
    brand_id
FROM public.products
WHERE visible = true;

-- Grant access
GRANT SELECT ON public.products_public TO anon, authenticated;

-- Verificare
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products_public' 
ORDER BY ordinal_position;
