-- CREARE ADMIN TEMPORAR PENTRU TESTARE
-- Acest script creează un admin temporar cu parolă simplă

-- 1) Asigură-te că admin@otka.ro există în tabela users
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

-- 2) Crează un admin temporar pentru testare (folosind Supabase Auth)
-- IMPORTANT: Acest utilizator trebuie creat prin Supabase Auth Dashboard sau prin API
-- Email: test-admin@otka.ro  
-- Parolă: Test123!

INSERT INTO public.users (email, role, partner_status, company_name, contact_name, phone)
VALUES ('test-admin@otka.ro', 'admin', 'active', 'OTKA Test Admin', 'Test Administrator', '+40 700 000 999')
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  partner_status = 'active';

-- 3) Verifică rezultatul
SELECT 
  'ADMINI CONFIGURAȚI:' as info,
  email, 
  role, 
  partner_status,
  company_name
FROM public.users 
WHERE role = 'admin'
ORDER BY email;