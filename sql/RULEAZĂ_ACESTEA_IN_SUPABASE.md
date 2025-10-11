# 🚀 SQL-uri de Rulat în Supabase - Sistem Categorii

## Ordinea de Execuție

Rulează aceste SQL-uri în **Supabase SQL Editor** în ordinea următoare:

---

## 1️⃣ Verifică și Adaugă Coloana Category în Products

**Fișier**: `/app/sql/verify_products_schema.sql`

```sql
-- Verifică coloanele existente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Adaugă coloana category dacă nu există (TEXT pentru nume categorie)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Creează index pentru performanță
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- Verificare finală
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('category', 'category_id', 'description', 'price_original')
ORDER BY column_name;
```

---

## 2️⃣ Creare Tabel Categories (DEJA RULAT)

**Fișier**: `/app/sql/create_categories_table.sql`

✅ **AI ZIS CĂ L-AI RULAT DEJA** - Skip dacă tabelul `categories` există.

Verificare rapidă:
```sql
SELECT COUNT(*) FROM public.categories;
-- Dacă returnează număr (ex: 10), tabelul există și e populat ✅
```

---

## 3️⃣ Fix View products_public

**Fișier**: `/app/sql/fix_products_public_view.sql`

```sql
-- Drop view existent
DROP VIEW IF EXISTS public.products_public;

-- Recreare view cu coloanele corecte (fără created_at, cu category)
CREATE VIEW public.products_public AS
SELECT 
    id,
    sku,
    name,
    slug,
    description,
    price_public_ttc,
    price_original,
    stock_qty,
    gallery,
    category,
    brand_id
FROM public.products
WHERE visible = true;

-- Grant access
GRANT SELECT ON public.products_public TO anon, authenticated;

-- Verificare
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products_public' 
ORDER BY ordinal_position;
```

---

## ✅ Verificare Finală

După rularea SQL-urilor, verifică:

```sql
-- 1. Tabel categories există și e populat
SELECT id, name, slug, active, sort_order 
FROM public.categories 
ORDER BY sort_order ASC;

-- 2. Coloana category există în products
SELECT id, name, category 
FROM public.products 
LIMIT 5;

-- 3. View products_public include category
SELECT id, name, category 
FROM public.products_public 
LIMIT 5;
```

---

## 🎯 Ce Face Fiecare SQL

| SQL | Scop |
|-----|------|
| `verify_products_schema.sql` | Adaugă coloana `category` în tabelul `products` |
| `create_categories_table.sql` | Creează tabelul `categories` cu 10 categorii predefinite (DEJA RULAT) |
| `fix_products_public_view.sql` | Fix view `products_public` - elimină `created_at`, adaugă `category` |

---

## ⚠️ Dacă Apare Eroare

### Eroare: "column created_at does not exist"
✅ **REZOLVAT** - Rulează `fix_products_public_view.sql`

### Eroare: "relation categories already exists"
✅ **NORMAL** - Ai rulat deja `create_categories_table.sql`, skip-ul

### Eroare: "column category does not exist"
❌ Rulează `verify_products_schema.sql` ÎNAINTE de `fix_products_public_view.sql`

---

## 📊 Rezultat Final

După rularea SQL-urilor:
- ✅ Tabel `categories` cu 10 categorii (Mese, Scaune, Canapele, etc.)
- ✅ Coloana `category` în `products`
- ✅ View `products_public` cu `category` inclus
- ✅ API-uri funcționale pentru CRUD categorii
- ✅ Filtrare produse pe homepage după categorie

---

## 🚀 Următorii Pași După SQL

1. Restart aplicația Next.js (dacă e local)
2. Du-te în **Admin Dashboard** → **Produse** → **Adaugă Produs**
3. Verifică că dropdown-ul de categorii apare
4. Adaugă o categorie nouă cu butonul "+ Nouă"
5. Salvează un produs cu categorie
6. Verifică pe homepage că filtrele de categorii apar

---

**Întrebări?** Verifică console-ul browser-ului și logurile Supabase pentru erori.
