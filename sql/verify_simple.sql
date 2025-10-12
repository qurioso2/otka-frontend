-- =====================================================
-- VERIFICARE SIMPLĂ - Rulează fiecare query SEPARAT!
-- =====================================================

-- ============ QUERY 1: Verifică tabelele ============
-- Copiază și rulează DOAR ACEST QUERY:

SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tax_rates', 'company_settings', 'proforme', 'proforma_items')
ORDER BY tablename;

-- Expect să vezi 4 rânduri:
-- company_settings
-- proforma_items  
-- proforme
-- tax_rates


-- ============ QUERY 2: Verifică cotele TVA ============
-- După ce vezi rezultatul de mai sus, rulează ACEST:

SELECT * FROM tax_rates ORDER BY sort_order;

-- Expect să vezi 5 rânduri cu cotele:
-- Standard 2025 (21%)
-- Standard 2024 (19%)
-- Redusă (9%)
-- Super-redusă (5%)
-- Scutit (0%)


-- ============ QUERY 3: Verifică company_settings ============
-- Apoi rulează ACEST:

SELECT * FROM company_settings LIMIT 1;

-- Expect să vezi 1 rând cu datele OTKA


-- ============ QUERY 4: Verifică products au tax_rate_id ============
-- În final, rulează ACEST:

SELECT 
  COUNT(*) as total_products,
  COUNT(tax_rate_id) as products_with_tax,
  COUNT(*) - COUNT(tax_rate_id) as products_without_tax
FROM products;

-- Expect: products_without_tax = 0 (toate produsele au tax_rate_id)
