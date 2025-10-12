# 🚀 QUICK START - Rulează Acest SQL PRIMUL

## ⚡ IMPORTANT - Fix aplicat pentru eroarea DEFAULT

**Problema:** PostgreSQL nu permite subquery în expresii DEFAULT.

**Soluție:** Am înlocuit DEFAULT cu UPDATE manual după migrare.

---

## 📝 PAȘI DE RULARE

### 1. Deschide Supabase SQL Editor
https://supabase.com/dashboard/project/kzwzqtghjnkrdjfosbdz/sql

### 2. Copiază și Rulează SQL-ul
Deschide `/app/sql/proforma_system_schema.sql` și copiază ÎNTREGUL conținut în SQL Editor.

Click **RUN** (sau Ctrl+Enter)

### 3. Verificare Succces

După rulare, verifică că totul a mers bine:

```sql
-- 1. Verifică tabelele create
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%tax%' OR tablename LIKE '%proforma%' OR tablename LIKE '%company%')
ORDER BY tablename;

-- Expect: 
-- company_settings
-- proforma_items
-- proforme
-- tax_rates

-- 2. Verifică cotele TVA
SELECT id, name, rate, active, is_default 
FROM tax_rates 
ORDER BY sort_order;

-- Expect: 5 rows
-- Standard 2025 (21%) - active: true, is_default: true
-- Standard 2024 (19%) - active: false
-- Redusă (9%) - active: true
-- Super-redusă (5%) - active: true
-- Scutit (0%) - active: true

-- 3. Verifică company_settings
SELECT company_name, cui, proforma_series, proforma_counter 
FROM company_settings;

-- Expect: 1 row cu date default OTKA

-- 4. Verifică că products au tax_rate_id
SELECT COUNT(*) as total_products,
       COUNT(tax_rate_id) as products_with_tax_rate
FROM products;

-- Expect: Toate produsele să aibă tax_rate_id (ambele numere egale)

-- 5. Test trigger numerotare
INSERT INTO proforme (client_type, client_name, client_email)
VALUES ('PF', 'Test Client', 'test@example.com')
RETURNING id, series, number, full_number;

-- Expect: full_number = 'OTK-00001'

-- Cleanup test
DELETE FROM proforme WHERE client_name = 'Test Client';
```

---

## ✅ Dacă totul merge bine

Vei vedea:
- ✅ 4 tabele noi (tax_rates, company_settings, proforme, proforma_items)
- ✅ 5 cote TVA predefinite
- ✅ 1 rând în company_settings
- ✅ Toate produsele cu tax_rate_id setat
- ✅ Trigger auto-increment funcționează

---

## ❌ Dacă primești erori

### Eroare: "relation already exists"
**Cauză:** Ai mai rulat SQL-ul înainte.

**Soluție:** SQL-ul e safe to re-run. Ignoră eroarea sau șterge tabelele:
```sql
DROP TABLE IF EXISTS proforma_items CASCADE;
DROP TABLE IF EXISTS proforme CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS tax_rates CASCADE;
```

Apoi re-rulează schema completă.

---

### Eroare: "column tax_rate_id already exists"
**Cauză:** Coloana deja există în products.

**Soluție:** Ignoră - SQL-ul verifică automat și skip-uiește.

---

### Eroare: "function already exists"
**Cauză:** Funcțiile helper deja create.

**Soluție:** SQL-ul folosește `CREATE OR REPLACE` - e safe.

---

## 🎯 NEXT STEPS după SQL

1. **Refresh aplicația** - reîncarcă pagina admin
2. **Test ProductsAdmin** - Adaugă/editează produs → vezi dropdown TVA
3. **Configurează Company Settings** (când va fi gata UI-ul):
   - Completează CUI, IBAN real
   - Upload logo OTKA
   - Template-uri email

4. **Creează prima proformă de test** (când va fi gata ProformaManager)

---

## 📞 SUPPORT

Dacă întâmpini probleme la rularea SQL-ului:
1. Verifică că ești conectat la Supabase project corect (kzwzqtghjnkrdjfosbdz)
2. Verifică că ai permisiuni de admin în Supabase
3. Citește mesajul de eroare complet și caută în acest fișier

---

**🎉 După ce rulezi cu succes, sistemul de proforme e 80% gata!**

Lipsește doar:
- TaxRatesManager.tsx (UI management cote)
- CompanySettingsManager.tsx (UI setări firmă)
- ProformaManager.tsx (UI proforme) ← CEL MAI IMPORTANT

**Estimated time to 100%:** ~4-5 ore (majoritatea pentru ProformaManager)
