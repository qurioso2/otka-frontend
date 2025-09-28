-- SETUP UTILIZATORI ADMIN - DIAGNOZA SI CONFIGURARE (VERSIUNE CORECTATA)
-- Acest script verifică și configurează utilizatorii admin

-- 1) DIAGNOZA - Verifică utilizatorii existenți
SELECT 
  'UTILIZATORI EXISTENTI:' as info,
  id,
  email, 
  role, 
  partner_status,
  company_name,
  contact_name,
  phone
FROM public.users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'partner' THEN 2 
    ELSE 3 
  END, 
  email;

-- 2) VERIFICA FUNCTIILE DE AUTENTIFICARE
SELECT 
  'FUNCTII AUTH DISPONIBILE:' as info,
  'auth.email(): ' || COALESCE(auth.email(), 'NULL') as auth_email,
  'auth.jwt()->>email: ' || COALESCE(auth.jwt() ->> 'email', 'NULL') as jwt_email;

-- 3) INSERARE/ACTUALIZARE UTILIZATORI ADMIN
-- Înlocuiește email-urile cu cele corecte pentru proiectul tău

-- Admin principal OTKA
INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone, vat_id)
VALUES ('admin@otka.ro', 'admin', 'active', 'MERCURY VC S.R.L.', 'Administrator OTKA', '+40 700 000 000', 'RO48801623')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  partner_status = 'active',
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  vat_id = EXCLUDED.vat_id;

-- Admin secundar (opțional - schimbă email-ul)
INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone)
VALUES ('admin2@otka.ro', 'admin', 'active', 'OTKA Admin 2', 'Administrator Secundar', '+40 700 000 001')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  partner_status = 'active',
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone;

-- 4) PARTENERI DEMO PENTRU TESTARE
INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone, vat_id)
VALUES 
  ('partner1@test.ro', 'partner', 'active', 'Design Studio Alpha SRL', 'Ion Popescu', '+40 700 000 100', 'RO12345678'),
  ('partner2@test.ro', 'partner', 'pending', 'Arhitect Beta SRL', 'Maria Ionescu', '+40 700 000 101', 'RO87654321'),
  ('partner3@test.ro', 'partner', 'suspended', 'Interior Gamma SRL', 'Gheorghe Vasile', '+40 700 000 102', 'RO11111111')
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  partner_status = EXCLUDED.partner_status,
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  vat_id = EXCLUDED.vat_id;

-- 5) VISITOR DEMO PENTRU TESTARE
INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone)
VALUES ('visitor@test.ro', 'visitor', 'pending', NULL, 'Visitor Test', '+40 700 000 200')
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  partner_status = EXCLUDED.partner_status,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone;

-- 6) VERIFICA REZULTATUL DUPA INSERARE
SELECT 
  'UTILIZATORI DUPA ACTUALIZARE:' as info,
  id,
  email, 
  role, 
  partner_status,
  company_name,
  contact_name,
  vat_id
FROM public.users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'partner' THEN 2 
    ELSE 3 
  END,
  partner_status DESC,
  email;

-- 7) TESTARE FUNCTII IS_ADMIN (doar dacă funcția există)
SELECT 
  'TEST FUNCTIE IS_ADMIN:' as info,
  email,
  role,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') 
    THEN public.is_admin(email)::text
    ELSE 'FUNCTIA NU EXISTA'
  END as is_admin_result
FROM public.users 
WHERE role = 'admin';

-- 8) VERIFICA CONSTRAINT-URILE
SELECT 
  'VERIFICARE CONSTRAINTS:' as info,
  COUNT(CASE WHEN role IN ('visitor','partner','admin') THEN 1 END) as valid_roles,
  COUNT(CASE WHEN partner_status IN ('pending','active','suspended') THEN 1 END) as valid_statuses,
  COUNT(*) as total_users
FROM public.users;

-- 9) INFORMATII PENTRU DEBUG AUTH
SELECT 
  'INFO DEBUG AUTH:' as info,
  'Pentru a testa autentificarea ca admin:' as instructiuni,
  '1. Loghează-te în aplicația cu admin@otka.ro' as pas1,
  '2. Verifică că auth.email() returnează admin@otka.ro' as pas2,
  '3. Verifică că policies permit accesul admin' as pas3,
  '4. Dacă nu merge, rulează fix_auth_function.sql' as pas4;