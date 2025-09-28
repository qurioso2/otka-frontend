-- DEBUG PROBLEME AUTENTIFICARE - DIAGNOZA DETALIATA
-- Rulează acest script când ești logat pentru a vedea ce se întâmplă

-- 1) VERIFICA CINE ESTI IN SESIUNE
SELECT 
  'INFORMATII SESIUNE CURENTA:' as debug_type,
  auth.uid() as user_id,
  auth.email() as auth_email_function,
  auth.jwt() ->> 'email' as jwt_email_field,
  auth.jwt() ->> 'role' as jwt_role_field,
  auth.role() as auth_role_function;

-- 2) VERIFICA UTILIZATORUL IN TABELA USERS
SELECT 
  'UTILIZATOR IN TABELA USERS:' as debug_type,
  u.email,
  u.role,
  u.partner_status,
  u.company_name,
  CASE 
    WHEN u.email = auth.email() THEN 'MATCH ✓'
    ELSE 'NO MATCH ✗'
  END as email_match
FROM public.users u
WHERE u.email = auth.email() OR u.email = auth.jwt() ->> 'email';

-- 3) TESTARE FUNCTIE IS_ADMIN
SELECT 
  'TEST FUNCTIE IS_ADMIN:' as debug_type,
  public.is_admin(auth.email()) as is_admin_with_auth_email,
  public.is_admin(auth.jwt() ->> 'email') as is_admin_with_jwt_email,
  EXISTS(
    SELECT 1 FROM public.users u 
    WHERE u.email = auth.email() 
    AND u.role = 'admin'
  ) as direct_admin_check;

-- 4) VERIFICA POLICIES PE TABELE
-- Test policy pentru users
SELECT 
  'TEST POLICY USERS:' as debug_type,
  'Daca vezi aceasta linie, policy pentru users functioneaza' as result;

-- Test policy pentru products  
SELECT 
  'TEST POLICY PRODUCTS:' as debug_type,
  COUNT(*) as total_products_visible
FROM public.products;

-- Test policy pentru partner_orders
SELECT 
  'TEST POLICY PARTNER_ORDERS:' as debug_type,
  COUNT(*) as total_orders_visible
FROM public.partner_orders;

-- 5) VERIFICA DACA POTI FACE OPERATIUNI ADMIN
-- Test insert în tabela users (doar admin poate)
BEGIN;
INSERT INTO public.users (email, role, partner_status, company_name, contact_name) 
VALUES ('test_admin_access@temp.com', 'visitor', 'pending', 'Test Company', 'Test Contact');

SELECT 
  'TEST INSERT USERS (ADMIN ONLY):' as debug_type,
  'Daca vezi aceasta linie, ai drepturi admin pentru insert' as result;

-- Rollback pentru a nu lăsa date temporare
ROLLBACK;

-- 6) AFISEAZA TOATE POLICIES ACTIVE
SELECT 
  'POLICIES ACTIVE:' as debug_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;