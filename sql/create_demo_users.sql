-- CREEAZĂ UTILIZATORI DEMO PENTRU TESTARE
-- Rulați după toate celelalte script-uri SQL

-- 1) Admin user
INSERT INTO public.users (
  email, 
  company_name, 
  contact_name, 
  role, 
  partner_status,
  created_at
) VALUES (
  'admin@otka.ro',
  'OTKA Administration',
  'Administrator OTKA',
  'admin',
  'active',
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  partner_status = 'active',
  company_name = 'OTKA Administration',
  contact_name = 'Administrator OTKA';

-- 2) Partener activ pentru testare
INSERT INTO public.users (
  email, 
  company_name, 
  vat_id,
  contact_name, 
  phone,
  role, 
  partner_status,
  created_at
) VALUES (
  'partener@test.ro',
  'Compania Test SRL',
  'RO12345678',
  'Manager Partener',
  '+40123456789',
  'partner',
  'active',
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'partner',
  partner_status = 'active',
  company_name = 'Compania Test SRL',
  vat_id = 'RO12345678',
  contact_name = 'Manager Partener',
  phone = '+40123456789';

-- 3) Partener în așteptare pentru testare
INSERT INTO public.users (
  email, 
  company_name, 
  vat_id,
  contact_name, 
  role, 
  partner_status,
  created_at
) VALUES (
  'pending@test.ro',
  'Compania Pending SRL',
  'RO87654321',
  'Manager Pending',
  'partner',
  'pending',
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'partner',
  partner_status = 'pending',
  company_name = 'Compania Pending SRL',
  vat_id = 'RO87654321',
  contact_name = 'Manager Pending';

-- 4) Verificare utilizatori creați
SELECT email, role, partner_status, company_name, contact_name 
FROM public.users 
WHERE email IN ('admin@otka.ro', 'partener@test.ro', 'pending@test.ro')
ORDER BY email;