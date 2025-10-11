-- FIX pentru CRUD Articles - Probleme RLS
-- Rulează acest SQL în Supabase SQL Editor

-- Step 1: Verifică user-ul admin
DO $$ 
DECLARE
    admin_count INTEGER;
    admin_user RECORD;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.users WHERE role = 'admin';
    RAISE NOTICE '✓ Admin users found: %', admin_count;
    
    IF admin_count > 0 THEN
        FOR admin_user IN SELECT email, id, role FROM public.users WHERE role = 'admin' LOOP
            RAISE NOTICE '  - Email: %, ID: %, Role: %', admin_user.email, admin_user.id, admin_user.role;
        END LOOP;
    ELSE
        RAISE WARNING '⚠ NO ADMIN USERS FOUND! You need to create an admin user first.';
    END IF;
END $$;

-- Step 2: Drop existing policies (pentru a le recrea corect)
DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
DROP POLICY IF EXISTS "Admin write articles" ON public.articles;
DROP POLICY IF EXISTS "Admin update articles" ON public.articles;
DROP POLICY IF EXISTS "Admin delete articles" ON public.articles;

-- Step 3: Creare policy pentru READ (public poate vedea doar published)
CREATE POLICY "Public read published articles" 
ON public.articles
FOR SELECT 
USING (published = true);

-- Step 4: Creare policy pentru admin READ (poate vedea tot)
CREATE POLICY "Admin read all articles"
ON public.articles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Step 5: Creare policy pentru INSERT
CREATE POLICY "Admin insert articles"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Step 6: Creare policy pentru UPDATE
CREATE POLICY "Admin update articles"
ON public.articles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Step 7: Creare policy pentru DELETE
CREATE POLICY "Admin delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
    )
);

-- Step 8: Verifică că policies au fost create
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'articles';
    
    RAISE NOTICE '✓ Total RLS policies for articles: %', policy_count;
    
    IF policy_count >= 5 THEN
        RAISE NOTICE '✅ SUCCESS: All RLS policies created!';
    ELSE
        RAISE WARNING '⚠ Expected 5 policies, found %', policy_count;
    END IF;
END $$;

-- Step 9: Test basic insert (will fail if no admin user)
-- Uncomment to test:
-- INSERT INTO public.articles (slug, title, body, published) 
-- VALUES ('test-rls-fix', 'Test RLS Fix', 'Testing after RLS fix', false);

DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE 'RLS FIX COMPLETE!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Ensure admin@otka.ro exists in users table with role=admin';
    RAISE NOTICE '2. Test CRUD from application';
    RAISE NOTICE '3. Check logs for any auth issues';
    RAISE NOTICE '====================================';
END $$;
