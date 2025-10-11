-- FIX pentru DELETE products - doar acest policy lipsește

-- Șterge policy vechi dacă există
DROP POLICY IF EXISTS "Admin delete products" ON public.products;

-- Creare policy pentru DELETE
CREATE POLICY "Admin delete products"
ON public.products
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Verificare policies pentru products
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd, policyname;
