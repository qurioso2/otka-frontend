# 🚀 SQL-uri Noi de Rulat în Supabase

**Data**: 11 Octombrie 2025  
**Features**: Brands, Summary, Sortare, Rich Content, Recent Viewed

---

## Ordinea de Execuție

Rulează aceste SQL-uri în **Supabase SQL Editor** în ordinea următoare:

---

## 1️⃣ Creează Tabelul Brands

**Fișier**: `/app/sql/create_brands_table.sql`

Acest SQL creează:
- Tabel `brands` cu RLS policies
- 10 branduri predefinite (Pianca, Lago, Molteni, B&B Italia, etc.)
- Trigger pentru auto-update `updated_at`

```sql
-- Rulează întreg fișierul create_brands_table.sql
-- Conține ~150 linii SQL
```

**Verificare**:
```sql
SELECT id, name, slug, active FROM public.brands ORDER BY sort_order;
-- Ar trebui să returneze 10 branduri
```

---

## 2️⃣ Adaugă Summary și Brand_ID în Products

**Fișier**: `/app/sql/add_summary_and_brand_to_products.sql`

Acest SQL:
- Adaugă coloana `summary` (TEXT) în `products`
- Actualizează `brand_id` cu foreign key către `brands`
- Recrează view `products_public` cu `summary` și `brand_name`

```sql
-- Rulează întreg fișierul add_summary_and_brand_to_products.sql
```

**Verificare**:
```sql
-- Verifică coloanele noi
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name IN ('summary', 'brand_id');

-- Verifică view actualizat
SELECT id, name, summary, brand_id, brand_name 
FROM products_public 
LIMIT 3;
```

---

## ✅ Verificare Finală

După rularea SQL-urilor:

```sql
-- 1. Brands există
SELECT COUNT(*) FROM brands;
-- Expect: 10

-- 2. Products au coloanele noi
SELECT 
  id, 
  name, 
  summary, 
  brand_id,
  category 
FROM products 
LIMIT 3;

-- 3. View products_public include brand_name
SELECT 
  id, 
  name, 
  brand_name,
  summary,
  category
FROM products_public 
LIMIT 3;
```

---

## 🎯 Ce Se Schimbă în UI

### 1. Admin Dashboard → Produse

**Nou câmp: Brand**
- Dropdown cu branduri disponibile
- Buton "+ Nou" pentru adăugare brand inline
- Similar cu Categories

**Nou câmp: Summary**
- Textarea simplu pentru rezumat scurt (2-3 propoziții)
- Va fi afișat în preview-ul produsului

**Nou: Rich Text Editor**
- Înlocuiește textarea simplă pentru Descriere
- Toolbar cu formatare: Bold, Italic, Headings, Lists
- Output HTML stocat în DB

### 2. Homepage

**Nou: Sortare după Preț**
- Dropdown: "Implicit", "Preț crescător", "Preț descrescător"
- Funcționează împreună cu filtrele de categorii
- Infinite scroll păstrează sortarea

### 3. Pagina Produs

**Nou: Summary Box**
- Cutie albastră sub titlu cu rezumatul produsului
- Afișat doar dacă există summary

**Nou: Descriere Rich Text**
- Formatare completă (headings, bold, italic, lists)
- Secțiune separată "Detalii Complete"

**Nou: Recent Viewed Carousel**
- Grid cu ultimele 10 produse vizualizate
- Stocat în LocalStorage
- Exclude produsul curent
- Automat updatat

---

## 🐛 Troubleshooting

### Eroare: "foreign key constraint"
❌ Verifică că tabelul `brands` a fost creat ÎNAINTE de `add_summary_and_brand_to_products.sql`

### Eroare: "column summary already exists"
✅ Normal dacă ai rulat SQL-ul de 2 ori. Ignoră eroarea.

### Eroare: "view products_public does not exist"
❌ Rulează `add_summary_and_brand_to_products.sql` care recrează view-ul.

### Brands nu apar în dropdown
❌ Verifică:
1. SQL `create_brands_table.sql` rulat corect?
2. API `/api/admin/brands/list` returnează date? (Network tab)
3. RLS policies permit citirea?

---

## 📊 Features Complete List

| Feature | Backend | Frontend | DB |
|---------|---------|----------|-----|
| **Sortare Preț Homepage** | ✅ API updated | ✅ Dropdown + state | N/A |
| **Brands System** | ✅ CRUD APIs | ✅ Admin dropdown + inline | ✅ Tabel + FK |
| **Summary Field** | ✅ API save/load | ✅ Textarea în form | ✅ Coloană în DB |
| **Rich Text Editor** | ✅ Save HTML | ✅ Toolbar editor | ✅ HTML în DB |
| **Product Page Summary Box** | ✅ API return summary | ✅ Blue box display | ✅ Summary field |
| **Rich Description Display** | ✅ API return HTML | ✅ dangerouslySetInnerHTML | ✅ Description field |
| **Recent Viewed** | N/A | ✅ LocalStorage | N/A (client-side) |
| **Recent Viewed Carousel** | N/A | ✅ Grid component | N/A (client-side) |

---

## 🚀 Testing Checklist

### Admin Dashboard
- [ ] Adaugă produs cu brand selectat din dropdown
- [ ] Click "+ Nou" pe brands → adaugă brand nou
- [ ] Completează Summary cu text scurt
- [ ] Folosește Rich Text Editor pentru descriere (bold, liste, headings)
- [ ] Salvează → verifică în DB: `SELECT summary, brand_id FROM products WHERE id = X;`

### Homepage
- [ ] Verifică dropdown "Sortare" apare
- [ ] Selectează "Preț crescător" → produsele se sortează
- [ ] Selectează o categorie → sortarea se păstrează
- [ ] Infinite scroll funcționează cu sortare activă

### Pagina Produs
- [ ] Summary box albastru apare (dacă există summary)
- [ ] Secțiunea "Detalii Complete" afișează HTML formatat
- [ ] Vizualizează 3-4 produse diferite
- [ ] Scroll jos → "Recent vizualizate" carousel apare
- [ ] Click pe produs din carousel → merge la pagina corectă

### Recent Viewed
- [ ] LocalStorage: Deschide DevTools → Application → Local Storage → otka_recent_viewed
- [ ] Verifică că produsele se adaugă în array
- [ ] Verifică că produsul curent NU apare în carousel
- [ ] Închide browser → redeschide → recent viewed se păstrează

---

## 📁 Fișiere Create/Modificate

### SQL (2 fișiere noi)
1. `/app/sql/create_brands_table.sql` - Brands table
2. `/app/sql/add_summary_and_brand_to_products.sql` - Summary + brand_id

### API (3 fișiere noi)
1. `/app/app/api/admin/brands/list/route.ts`
2. `/app/app/api/admin/brands/create/route.ts`
3. `/app/app/api/public/brands/route.ts`

### Components (3 fișiere noi)
1. `/app/components/RichTextEditor.tsx` - Rich text cu toolbar
2. `/app/components/RecentViewedCarousel.tsx` - Carousel produse recente
3. `/app/app/p/[slug]/TrackRecentViewed.tsx` - Track client-side

### Libraries (1 fișier nou)
1. `/app/lib/recentViewed.ts` - LocalStorage helpers

### Fișiere Modificate
1. `/app/app/admin/ProductsAdmin.tsx` - Brands dropdown + RichTextEditor
2. `/app/app/ui/ProductsInfinite.tsx` - Sortare dropdown
3. `/app/app/api/public/products/route.ts` - Sort parameter
4. `/app/app/api/admin/products/create/route.ts` - Save brand_id + summary
5. `/app/app/api/admin/products/update/route.ts` - Update brand_id + summary
6. `/app/app/p/[slug]/page.tsx` - Summary box + carousel

---

## 🎉 Status Final

**Toate Features Implementate:**
- ✅ Homepage sortare după preț
- ✅ Brands system (CRUD + UI)
- ✅ Summary field
- ✅ Rich Text Editor
- ✅ Product Page cu Summary Box
- ✅ Rich Description Display
- ✅ Recent Viewed (LocalStorage)
- ✅ Recent Viewed Carousel

**Gata pentru testing!** 🚀
