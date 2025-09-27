# HOTFIX URGENT PENTRU PRODUCȚIE - OTKA.ro

## EROARE: Application error în producție
**Cauza**: Modificări recente care necesită update-uri în baza de date de producție

## FIX IMEDIAT:

### 1. RULAȚI în Supabase SQL Editor (PRIORITATE MAXIMĂ):

```sql
-- 1) Adăugați coloana price_original la products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price_original numeric;

-- 2) Recreați view-ul products_public
DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public AS
SELECT id, sku, name, slug, price_public_ttc, price_original, stock_qty, gallery, visible
FROM public.products
WHERE visible = true;

-- 3) Update produse demo cu prețuri originale
UPDATE public.products 
SET price_original = CASE 
    WHEN sku = 'SKU-OTKA-001' THEN 4299
    WHEN sku = 'SKU-OTKA-002' THEN 5299  
    WHEN sku = 'SKU-OTKA-003' THEN 3199
    WHEN sku = 'SKU-OTKA-004' THEN 1899
    WHEN sku = 'SKU-OTKA-005' THEN 1199
    ELSE price_original
END
WHERE sku IN ('SKU-OTKA-001', 'SKU-OTKA-002', 'SKU-OTKA-003', 'SKU-OTKA-004', 'SKU-OTKA-005');
```

### 2. DEPLOYMENT FIX (dacă SQL nu rezolvă):

Dacă problema persistă, am pregătit un revert rapid la versiunea stabilă în următoarele 2 minute.

### 3. VERIFICARE:
După rularea SQL, verificați:
- https://otka.ro (homepage cu prețuri)
- https://otka.ro/login (formular login)
- https://otka.ro/parteneri (pagina publică)

## URMĂTORII PAȘI:
După fix, să implementez tabelele pentru comenzi în următoarea iterație, pas cu pas.