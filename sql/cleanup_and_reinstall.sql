-- =====================================================
-- CLEANUP COMPLET + REINSTALL - Doar dacă e necesar!
-- =====================================================
-- ⚠️ ATENȚIE: Acest script ȘTERGE toate datele proforme!
-- Folosește doar dacă verificarea arată probleme
-- =====================================================

-- Șterge policy-urile vechi (acestea cauzează eroarea)
DROP POLICY IF EXISTS "Public can view active tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Authenticated can view all tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Authenticated can manage tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Authenticated can view company settings" ON company_settings;
DROP POLICY IF EXISTS "Authenticated can update company settings" ON company_settings;
DROP POLICY IF EXISTS "Authenticated can view all proforme" ON proforme;
DROP POLICY IF EXISTS "Authenticated can manage proforme" ON proforme;
DROP POLICY IF EXISTS "Authenticated can view proforma items" ON proforma_items;
DROP POLICY IF EXISTS "Authenticated can manage proforma items" ON proforma_items;

-- Șterge tabelele în ordinea corectă (cascade)
DROP TABLE IF EXISTS proforma_items CASCADE;
DROP TABLE IF EXISTS proforme CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS tax_rates CASCADE;

-- Șterge view-urile
DROP VIEW IF EXISTS proforma_stats CASCADE;
DROP VIEW IF EXISTS proforme_complete CASCADE;

-- Șterge funcțiile
DROP FUNCTION IF EXISTS get_next_proforma_number() CASCADE;
DROP FUNCTION IF EXISTS update_all_products_tax_rate(BIGINT, BIGINT) CASCADE;
DROP FUNCTION IF EXISTS auto_increment_proforma_number() CASCADE;
DROP FUNCTION IF EXISTS update_proforma_totals() CASCADE;
DROP FUNCTION IF EXISTS update_tax_rates_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_company_settings_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_proforme_timestamp() CASCADE;

-- Șterge coloana tax_rate_id din products (dacă există și vrei re-migrare)
-- ALTER TABLE products DROP COLUMN IF EXISTS tax_rate_id;

-- =====================================================
-- ACUM RULEAZĂ: /app/sql/proforma_system_schema.sql
-- =====================================================
-- După ce ai rulat acest cleanup, rulează din nou schema completă!
-- =====================================================
