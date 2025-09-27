-- UPDATE OTKA PRODUCTS SCHEMA
-- Adăugarea câmpului price_original pentru afișarea prețurilor cu reducere

-- 1) Adăugați câmpul price_original la tabelul products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_original numeric;

-- 2) Actualizați view-ul products_public să includă price_original
CREATE OR REPLACE VIEW public.products_public AS
SELECT id, sku, name, slug, price_public_ttc, price_original, stock_qty, gallery, visible
FROM public.products
WHERE visible = true;

-- 3) Actualizați produsele demo cu prețuri originale pentru testing
UPDATE public.products 
SET price_original = CASE 
    WHEN sku = 'SKU-OTKA-001' THEN 4299  -- MacBook Air era 4299, acum 3499
    WHEN sku = 'SKU-OTKA-002' THEN 5299  -- iPhone 14 Pro era 5299, acum 4499
    WHEN sku = 'SKU-OTKA-003' THEN 3199  -- iPad Air era 3199, acum 2699
    WHEN sku = 'SKU-OTKA-004' THEN 1899  -- Apple Watch era 1899, acum 1599
    WHEN sku = 'SKU-OTKA-005' THEN 1199  -- AirPods Pro era 1199, acum 899
    ELSE price_original
END
WHERE sku IN ('SKU-OTKA-001', 'SKU-OTKA-002', 'SKU-OTKA-003', 'SKU-OTKA-004', 'SKU-OTKA-005');

-- 4) Verificați rezultatele
SELECT sku, name, price_original, price_public_ttc, 
       (price_original - price_public_ttc) as savings
FROM public.products 
WHERE price_original IS NOT NULL
ORDER BY sku;