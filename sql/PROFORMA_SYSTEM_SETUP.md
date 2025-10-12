# 🧾 OTKA Proforma System - Database Setup Guide

## 📋 Overview

Acest sistem adaugă la OTKA.ro următoarele funcționalități:

1. **Gestionare Cote TVA flexibile** (21%, 19%, 9%, 5%, 0%)
2. **Setări Companie** (CUI, IBAN, logo, template-uri)
3. **Facturi Proformă** cu generare automată număr
4. **Email notifications** pentru proforme

---

## 🚀 Setup Instructions

### Step 1: Rulează Schema SQL

În **Supabase SQL Editor**, rulează:

```sql
/app/sql/proforma_system_schema.sql
```

Acest script va crea:
- ✅ Tabel `tax_rates` (5 cote predefinite)
- ✅ Tabel `company_settings` (cu date default OTKA)
- ✅ Tabel `proforme` (facturi proformă)
- ✅ Tabel `proforma_items` (produse din proforme)
- ✅ Update `products` table → adaugă `tax_rate_id`
- ✅ Triggers pentru numerotare automată
- ✅ Triggers pentru recalculare totaluri
- ✅ Views pentru statistici
- ✅ RLS policies pentru securitate

---

### Step 2: Verificare După Rulare

```sql
-- 1. Verifică că tabelele există
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (
  tablename LIKE '%tax%' 
  OR tablename LIKE '%proforma%' 
  OR tablename LIKE '%company%'
);

-- Expect:
-- tax_rates
-- company_settings
-- proforme
-- proforma_items

-- 2. Verifică cotele TVA predefinite
SELECT * FROM public.tax_rates ORDER BY sort_order;

-- Expect: 5 rânduri
-- Standard 2025 (21%) - active, default
-- Standard 2024 (19%) - inactive
-- Redusă (9%) - active
-- Super-redusă (5%) - active
-- Scutit (0%) - active

-- 3. Verifică setările companiei
SELECT company_name, cui, iban_ron, proforma_series, proforma_counter 
FROM public.company_settings;

-- Expect: 1 rând cu date default OTKA

-- 4. Verifică că products au tax_rate_id
SELECT id, name, tax_rate_id, vat_rate 
FROM public.products 
LIMIT 3;

-- Expect: Fiecare produs are tax_rate_id populat

-- 5. Test trigger numerotare automată
INSERT INTO public.proforme (client_type, client_name, client_email) 
VALUES ('PF', 'Test Client', 'test@example.com') 
RETURNING id, series, number, full_number;

-- Expect: OTK-00001 (sau următorul număr dacă există deja proforme)

-- 6. Șterge proforma de test
DELETE FROM public.proforme WHERE client_name = 'Test Client';
```

---

## 📊 Schema Details

### 1. `tax_rates` - Cote TVA

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `name` | VARCHAR(100) | Nume cotă (ex: "Standard 2025") |
| `rate` | NUMERIC(5,2) | Procent (ex: 21.00) |
| `active` | BOOLEAN | Activ pentru selectare |
| `is_default` | BOOLEAN | Cotă implicită pentru produse noi |
| `effective_from` | DATE | Dată validitate |

**Cote predefinite:**
- ✅ Standard 2025: **21%** (active, default)
- Standard 2024: 19% (inactive)
- Redusă: 9% (active)
- Super-redusă: 5% (active)
- Scutit: 0% (active)

---

### 2. `products` - Update

**Adăugat:**
- `tax_rate_id` → BIGINT (FK către `tax_rates.id`)

**Migrare automată:**
- Produse cu `vat_rate = 19` → "Standard 2024"
- Produse cu `vat_rate = 21` → "Standard 2025"
- Altele → mapate la cotele corespunzătoare

---

### 3. `company_settings` - Setări Firmă

| Column | Type | Description |
|--------|------|-------------|
| `company_name` | VARCHAR(200) | Nume firmă |
| `cui` | VARCHAR(50) | CUI/CIF |
| `reg_com` | VARCHAR(100) | Registrul Comerțului |
| `address` | TEXT | Adresă completă |
| `phone` | VARCHAR(50) | Telefon |
| `email` | VARCHAR(100) | Email contact |
| `iban_ron` | VARCHAR(50) | IBAN pentru RON |
| `iban_eur` | VARCHAR(50) | IBAN pentru EUR |
| `logo_url` | TEXT | URL logo pentru PDF |
| `proforma_series` | VARCHAR(20) | Serie proforme (ex: OTK) |
| `proforma_counter` | INTEGER | Counter pentru numerotare |
| `email_subject_template` | TEXT | Template subiect email |
| `email_body_template` | TEXT | Template body email |
| `terms_and_conditions` | TEXT | Termeni și condiții PDF |

**Date default:** OTKA cu date placeholder

---

### 4. `proforme` - Facturi Proformă

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `series` | VARCHAR(20) | Serie (ex: OTK) |
| `number` | INTEGER | Număr incremental |
| `full_number` | VARCHAR(50) | Generated: OTK-00001 |
| `issue_date` | DATE | Dată emitere |
| `client_type` | VARCHAR(2) | PF sau PJ |
| `client_name` | VARCHAR(200) | Nume client/firmă |
| `client_cui` | VARCHAR(50) | CUI (doar PJ) |
| `client_email` | VARCHAR(100) | Email client |
| `currency` | VARCHAR(3) | RON sau EUR |
| `subtotal_no_vat` | NUMERIC(12,2) | Total fără TVA |
| `total_vat` | NUMERIC(12,2) | Total TVA |
| `total_with_vat` | NUMERIC(12,2) | Total cu TVA |
| `status` | VARCHAR(20) | pending / paid / cancelled |
| `pdf_url` | TEXT | URL PDF generat |
| `email_sent_at` | TIMESTAMPTZ | Când a fost trimis email |

**Triggers:**
- ✅ Auto-increment `number` la INSERT
- ✅ Auto-generate `full_number`
- ✅ Auto-update `updated_at`

---

### 5. `proforma_items` - Produse din Proforme

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `proforma_id` | BIGINT | FK către proforme |
| `product_id` | BIGINT | FK către products (optional) |
| `sku` | VARCHAR(100) | SKU produs (snapshot) |
| `name` | VARCHAR(200) | Nume produs |
| `quantity` | INTEGER | Cantitate |
| `unit_price` | NUMERIC(12,2) | Preț unitar FĂRĂ TVA |
| `tax_rate_id` | BIGINT | FK către tax_rates |
| `tax_rate_value` | NUMERIC(5,2) | Procent TVA (snapshot) |
| `subtotal` | NUMERIC(12,2) | Generated: quantity × unit_price |
| `vat_amount` | NUMERIC(12,2) | Generated: subtotal × tax_rate |
| `total` | NUMERIC(12,2) | Generated: subtotal + vat_amount |

**Triggers:**
- ✅ After INSERT/UPDATE/DELETE → recalculează totalurile în `proforme`

---

## 🔧 Helper Functions

### 1. Get Next Proforma Number

```sql
SELECT get_next_proforma_number();
-- Returns: următorul număr disponibil (fără a-l consuma)
```

### 2. Update Masiv Tax Rate pentru Produse

```sql
-- Exemplu: Schimbă toate produsele de la 19% la 21%
SELECT update_all_products_tax_rate(
  (SELECT id FROM tax_rates WHERE name = 'Standard 2024'), -- old
  (SELECT id FROM tax_rates WHERE name = 'Standard 2025')  -- new
);
-- Returns: numărul de produse actualizate
```

---

## 📊 Views Disponibile

### 1. `proforma_stats` - Statistici Generale

```sql
SELECT * FROM proforma_stats;
```

Returns:
- `total_proforme` - Total proforme
- `total_paid` - Proforme încasate
- `total_pending` - Proforme în așteptare
- `suma_incasata` - Suma totală încasată
- `suma_in_asteptare` - Suma în așteptare

### 2. `proforme_complete` - Proforme cu Detalii

```sql
SELECT * FROM proforme_complete WHERE status = 'pending';
```

Returns: Toate coloanele din `proforme` + `total_items` + `products_summary`

---

## 🔒 Security (RLS)

Toate tabelele au **Row Level Security** activat:

### `tax_rates`
- ✅ Public poate vedea doar `active = true`
- ✅ Authenticated pot vedea toate
- ✅ Authenticated pot modifica (CRUD)

### `company_settings`
- ✅ Authenticated pot vedea toate
- ✅ Authenticated pot actualiza

### `proforme` & `proforma_items`
- ✅ Authenticated pot vedea toate
- ✅ Authenticated pot modifica (CRUD)

**Note:** Adjust policies dacă vrei restricții pe role (ex: doar admin poate vedea proforme)

---

## 🧪 Testing Checklist

După rularea SQL-ului, testează:

### ✅ Tax Rates
```sql
-- 1. Toate cotele există
SELECT COUNT(*) FROM tax_rates; -- Expect: 5

-- 2. O singură cotă default
SELECT COUNT(*) FROM tax_rates WHERE is_default = true; -- Expect: 1

-- 3. Cotele active
SELECT name, rate FROM tax_rates WHERE active = true; -- Expect: 4 (toate minus Standard 2024)
```

### ✅ Products Migration
```sql
-- Toate produsele au tax_rate_id
SELECT COUNT(*) FROM products WHERE tax_rate_id IS NULL; -- Expect: 0

-- Produse pe cotă
SELECT tr.name, COUNT(p.id) as products_count
FROM products p
JOIN tax_rates tr ON p.tax_rate_id = tr.id
GROUP BY tr.name;
```

### ✅ Proforma Creation & Triggers
```sql
-- 1. Creează proformă
INSERT INTO proforme (client_type, client_name, client_email)
VALUES ('PF', 'Ion Popescu', 'ion@example.com')
RETURNING *;

-- Verifică: number = 1, full_number = 'OTK-00001'

-- 2. Adaugă produse
INSERT INTO proforma_items (proforma_id, name, quantity, unit_price, tax_rate_id, tax_rate_value)
VALUES 
  (1, 'Scaun Ergonomic', 2, 1000.00, (SELECT id FROM tax_rates WHERE name = 'Standard 2025'), 21.00),
  (1, 'Masă Birou', 1, 2500.00, (SELECT id FROM tax_rates WHERE name = 'Standard 2025'), 21.00);

-- 3. Verifică recalculare automată
SELECT 
  subtotal_no_vat, -- Expect: 4500.00 (2×1000 + 1×2500)
  total_vat,       -- Expect: 945.00 (4500 × 0.21)
  total_with_vat   -- Expect: 5445.00
FROM proforme WHERE id = 1;

-- 4. Cleanup
DELETE FROM proforme WHERE id = 1;
```

---

## 🚨 Common Issues & Solutions

### Issue: "column tax_rate_id already exists"

**Solution:** Script-ul verifică automat. Safe to re-run.

### Issue: "violates foreign key constraint"

**Cauză:** Încerci să ștergi o cotă TVA folosită în produse/proforme

**Solution:** 
```sql
-- Dezactivează cota în loc să o ștergi
UPDATE tax_rates SET active = false WHERE id = <ID>;
```

### Issue: Proforma counter resetat

**Solution:**
```sql
-- Setează manual counter-ul la valoarea maximă
UPDATE company_settings 
SET proforma_counter = (
  SELECT COALESCE(MAX(number), 0) FROM proforme
);
```

---

## 📝 Next Steps After Setup

1. ✅ **Update Company Settings** - Completează datele reale OTKA în `company_settings`
2. ✅ **Create APIs** - Endpoint-uri pentru CRUD tax_rates, company_settings, proforme
3. ✅ **Update ProductsAdmin** - Adaugă selector cotă TVA în form
4. ✅ **Create Admin UI** - TaxRatesManager, CompanySettingsManager, ProformaManager
5. ✅ **Implement PDF Generator** - Cu pdf-lib pentru proforme
6. ✅ **Implement Email Service** - Trimite proforme cu Nodemailer + ZOHO

---

## 📚 Additional Resources

- **Schema File:** `/app/sql/proforma_system_schema.sql`
- **API Endpoints:** (coming next) `/app/app/api/admin/proforme/`
- **Admin Components:** (coming next) `/app/components/admin/`

---

**🎉 Schema setup complete! Ready for API & UI implementation.**
