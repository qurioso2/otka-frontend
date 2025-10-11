-- FIX pentru Products - coloana condition nu permite NULL dar nu e populată

-- Fac coloana nullable (mai flexibil)
ALTER TABLE public.products ALTER COLUMN condition DROP NOT NULL;

-- Verificare
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'products' 
AND column_name = 'condition';
