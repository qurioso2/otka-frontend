-- =====================================================
-- VERIFICARE SETUP PROFORME - Rulează acest SQL
-- =====================================================

-- 1. Verifică că toate tabelele există
SELECT 
  'Tabele găsite:' as check_type,
  COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename IN ('tax_rates', 'company_settings', 'proforme', 'proforma_items'));
-- Expect: count = 4

-- 2. Lista tabelelor
SELECT tablename as "Tabel Găsit"
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename IN ('tax_rates', 'company_settings', 'proforme', 'proforma_items'))
ORDER BY tablename;

-- 3. Verifică cotele TVA (trebuie 5)
SELECT 
  'Cote TVA:' as check_type,
  COUNT(*) as count
FROM tax_rates;
-- Expect: count = 5

-- 4. Verifică datele tax_rates
SELECT 
  name as "Nume Cotă", 
  rate as "Procent", 
  active as "Activ",
  is_default as "Default"
FROM tax_rates 
ORDER BY sort_order;

-- 5. Verifică company_settings (trebuie 1 rând)
SELECT 
  'Company Settings:' as check_type,
  COUNT(*) as count
FROM company_settings;
-- Expect: count >= 1

-- 6. Verifică company_settings data
SELECT 
  company_name as "Firmă",
  proforma_series as "Serie",
  proforma_counter as "Counter"
FROM company_settings 
LIMIT 1;

-- 7. Verifică că products au tax_rate_id
SELECT 
  'Produse cu tax_rate_id:' as check_type,
  COUNT(*) as total_products,
  COUNT(tax_rate_id) as products_with_tax_rate,
  CASE 
    WHEN COUNT(*) = COUNT(tax_rate_id) THEN '✅ TOATE OK'
    ELSE '⚠️ UNELE PRODUSE NU AU tax_rate_id'
  END as status
FROM products;

-- 8. Verifică funcțiile helper
SELECT 
  'Funcții Helper:' as check_type,
  COUNT(*) as count
FROM pg_proc 
WHERE proname IN ('get_next_proforma_number', 'update_all_products_tax_rate');
-- Expect: count = 2

-- =====================================================
-- REZULTAT AȘTEPTAT:
-- =====================================================
-- ✅ Tabele găsite: 4
-- ✅ Cote TVA: 5
-- ✅ Company Settings: 1
-- ✅ Products cu tax_rate_id: TOATE OK
-- ✅ Funcții Helper: 2
-- =====================================================
