-- Verifică și actualizează schema products pentru a include coloana category

-- Verifică coloanele existente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Adaugă coloana category dacă nu există (TEXT pentru nume categorie)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Crează index pentru performanță
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Verificare finală
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('category', 'category_id', 'description', 'price_original')
ORDER BY column_name;
