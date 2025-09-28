-- SETUP UTILIZATORI ADMIN - DIAGNOZA SI CONFIGURARE
-- Acest script verifică și configurează utilizatorii admin

-- 1) DIAGNOZA - Verifică utilizatorii existenți
SELECT 
  'UTILIZATORI EXISTENTI:' as info,
  email, 
  role, 
  partner_status,
  company_name,
  contact_name
FROM public.users 
ORDER BY role DESC, email;

-- 2) VERIFICA FUNCTIILE DE AUTENTIFICARE
SELECT 
  'FUNCTII AUTH DISPONIBILE:' as info,
  'auth.email(): ' || COALESCE(auth.email(), 'NULL') as auth_email,
  'auth.jwt()->>email: ' || COALESCE(auth.jwt() ->> 'email', 'NULL') as jwt_email;

-- 3) INSERARE/ACTUALIZARE UTILIZATORI ADMIN
-- Înlocuiește email-urile cu cele corecte pentru proiectul tău

-- Admin principal
INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone)
VALUES ('admin@otka.ro', 'admin', 'active', 'OTKA Admin', 'Administrator OTKA', '+40 700 000 000')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  partner_status = 'active',
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone;

-- Admin secundar (opțional)
INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone)
VALUES ('admin2@otka.ro', 'admin', 'active', 'OTKA Admin 2', 'Administrator Secundar', '+40 700 000 001')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  partner_status = 'active',
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone;

-- Parteneri demo pentru testare
INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone)
VALUES 
  ('partner1@test.ro', 'partner', 'active', 'Test Partner SRL', 'Ion Popescu', '+40 700 000 100'),
  ('partner2@test.ro', 'partner', 'pending', 'Pending Partner SRL', 'Maria Ionescu', '+40 700 000 101'),
  ('partner3@test.ro', 'partner', 'suspended', 'Suspended Partner SRL', 'Gheorghe Vasile', '+40 700 000 102')
ON CONFLICT (email) 
DO UPDATE SET 
  role = EXCLUDED.role,
  partner_status = EXCLUDED.partner_status,
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone;

-- 4) VERIFICA REZULTATUL DUPA INSERARE
SELECT 
  'UTILIZATORI DUPA ACTUALIZARE:' as info,
  email, 
  role, 
  partner_status,
  company_name,
  contact_name
FROM public.users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'partner' THEN 2 
    ELSE 3 
  END,
  partner_status DESC,
  email;

-- 5) TESTARE FUNCTII IS_ADMIN
-- Verifica daca functia is_admin functioneaza corect
SELECT 
  'TEST FUNCTIE IS_ADMIN:' as info,
  email,
  role,
  public.is_admin(email) as is_admin_result
FROM public.users 
WHERE role = 'admin';

-- 6) INFORMATII PENTRU DEBUG AUTH
SELECT 
  'INFO DEBUG AUTH:' as info,
  'Pentru a testa autentificarea ca admin, trebuie sa:' as instructiuni,
  '1. Te loghezi in aplicatie cu admin@otka.ro' as pas1,
  '2. Verifici ca auth.email() returneaza admin@otka.ro' as pas2,
  '3. Verifici ca policies permit accesul admin' as pas3;