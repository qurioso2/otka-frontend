# 🔴 FIX URGENT - CRUD Nu Funcționează

## ❌ PROBLEMA IDENTIFICATĂ:

**Tabelele `articles` și posibil `products` NU EXISTĂ în Supabase!**

Toate operațiunile CRUD eșuează cu:
- **400 Bad Request** - Supabase nu poate insera în tabel inexistent
- **401 Unauthorized** - RLS policies nu funcționează fără tabel

## ✅ SOLUȚIE RAPIDĂ (5 minute):

### Pas 1: Deschide Supabase Dashboard

1. Mergi la: **https://supabase.com/dashboard**
2. Login cu contul tău
3. Selectează proiectul: **kzwzqtghjnkrdjfosbdz**

---

### Pas 2: Rulează SQL pentru Articles

1. **SQL Editor** (din meniul stâng)
2. **New query** (buton verde)
3. **Copiază și lipește** tot conținutul din:
   ```
   /app/sql/public_assets_and_articles_safe.sql
   ```
4. **RUN** (butonul verde jos-dreapta)

**Așteptat**: 
```
✓ Successfully executed
Tables created: public_assets, articles
Policies created: Admin write/update/delete, Public read
```

---

### Pas 3: Verifică AI Search Setup (pentru produse)

1. Tot în **SQL Editor** → **New query**
2. Copiază tot din:
   ```
   /app/sql/ai_search_setup_safe.sql
   ```
3. **RUN**

**Așteptat**:
```
✓ Successfully executed
Columns added: embedding, finish, color, material, width, length, height
Functions created: search_products_semantic, find_similar_finishes, find_similar_sizes
```

---

### Pas 4: Testează CRUD (după SQL)

#### A. Test Articole:
1. **http://localhost:3000/admin** (sau live URL)
2. Login: **admin@otka.ro** / **Parola!3**
3. Tab **Articole** → Click **+ Articol Nou**
4. Completează:
   - Slug: `test-articol-001`
   - Titlu: `Articol de Test`
   - Conținut: `Test content`
5. **Salvează**

**Așteptat**: ✅ "Articol creat cu succes!"

#### B. Test Produse:
1. Tab **Produse** → Click **+ Adaugă Produs**
2. Completează:
   - SKU: `TEST-001`
   - Nume: `Produs Test`
   - Preț: `100`
3. **Salvează**

**Așteptat**: ✅ "Produs adăugat cu succes!"

---

## 📋 Checklist SQL Obligatorii:

- [ ] `/app/sql/public_assets_and_articles_safe.sql` → Articole + Assets
- [ ] `/app/sql/ai_search_setup_safe.sql` → Produse + AI Search (BONUS)

---

## 🔍 Verificare Rapidă Tabele:

După rulare SQL, verifică în Supabase:

**Database** → **Tables**

Ar trebui să vezi:
- ✅ `articles` (id, slug, title, body, images, published, created_at)
- ✅ `products` (cu coloane: embedding, finish, color, material, etc.)
- ✅ `public_assets` (id, type, title, url, active)

---

## ⚠️ Erori Posibile:

### Eroare: "relation already exists"
**Fix**: Ignoră - înseamnă că tabelul deja există (SQL-ul e safe)

### Eroare: "extension vector does not exist"
**Fix**:
1. **Database** → **Extensions**
2. Caută **pgvector**
3. Click **Enable**
4. Rulează SQL-ul din nou

### Eroare: "function auth.email() does not exist"
**Fix**: Rulează mai întâi:
```sql
CREATE SCHEMA IF NOT EXISTS auth;
```

---

## 🚀 După Fix:

### CRUD va funcționa complet:
- ✅ Adăugare articole/produse
- ✅ Editare articole/produse
- ✅ Ștergere articole/produse
- ✅ Import cataloage CSV/Excel
- ✅ AI Search (după generare embeddings)

---

## 📞 Dacă nu merge după SQL:

**Check rapid în terminal**:
```bash
cd /app
yarn dev
# Apoi testează: http://localhost:3000/admin
```

**Check logs**:
```bash
tail -f /tmp/nextjs-test.log
```

Caută erori de tip:
- `relation "articles" does not exist`
- `permission denied for table`

---

## ✅ Status După Fix:

Când SQL-ul e rulat corect:

**Articole**: CRUD complet funcțional ✅
**Produse**: CRUD complet funcțional ✅
**Import Cataloage**: Funcțional ✅
**AI Search**: Ready (după embeddings) ⏳

---

**🎯 PASUL CEL MAI IMPORTANT: RULEAZĂ SQL-URILE ÎN SUPABASE ACUM!**

După ce faci asta, testează și confirmă că merge. Apoi trecem la import PDF! 🚀
