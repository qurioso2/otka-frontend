-- FIX simplu pentru INSERT și DELETE articles
-- UPDATE deja funcționează, deci autentificarea e OK

-- Șterge policies problematice
DROP POLICY IF EXISTS "Admin insert articles" ON public.articles;
DROP POLICY IF EXISTS "Admin delete articles" ON public.articles;

-- Creare policy simplă pentru INSERT - orice admin autentificat
CREATE POLICY "Admin insert articles"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Creare policy simplă pentru DELETE - orice admin autentificat
CREATE POLICY "Admin delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (
    (SELECT role FROM public.users WHERE email = (SELECT auth.email())) = 'admin'
);

-- Verificare
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'articles'
ORDER BY cmd, policyname;
