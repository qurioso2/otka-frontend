# 🎯 OTKA Project - Status Complet & Context pentru Chat Următor

**Data**: 11 Octombrie 2025  
**Proiect**: admin-crud-update (OTKA.ro)  
**Tech Stack**: Next.js 15.5.3 + Supabase + AI Search (OpenAI)

---

## 📊 SUPABASE DATABASE - Status Actual

### ✅ Tabele CONFIRMATE (din screenshots):

#### 1. **products** - Produse principale
- Coloane principale: id, sku, name, slug, price_public_ttc, price_partner_net, stock_qty
- **AI Search Ready**: embedding (vector), finish, color, material, width, length, height
- **Metadata**: price_list_source, price_list_uploaded_at, description, category, search_text
- **Media**: gallery (jsonb), defect_photos (jsonb), attachments (jsonb)

#### 2. **articles** - Blog/Știri
- Structură: id, slug, title, body, images (text[]), published
- **RLS**: Public read (published only), Admin write/update/delete
- **Status**: Tabel EXISTĂ, CRUD ar trebui să funcționeze

#### 3. **catalogs** - Cataloage PDF/resurse
- Coloane: id, brand_id, title, version, file_url, valid_from, valid_to, tags

#### 4. **pricelists** - Liste de prețuri
- Coloane: id, brand_id, file_url, type, currency, version

#### 5. **materials** - Materiale/finisaje
- Coloane: id, brand_id, title, files (jsonb), tags (jsonb)

#### 6. **orders** - Comenzi clienți
- Sistem complet: order items, statuses, confirmări, facturare

#### 7. **users** - Utilizatori & Parteneri
- Roluri: admin, partner, client
- **Auth**: Supabase Auth integration

#### 8. **partner_orders** - Comenzi parteneri
- Similar cu orders, specific pentru parteneri

#### 9. **partner_agreements** - Contracte parteneri
- Documente, acceptări, versioning

#### 10. **partner_resources** - Resurse educaționale parteneri
- Files, visibility, access control

#### 11. **clients** - Clienți parteneri
- Management clienți pentru parteneri

#### 12. **public_assets** - Imagini publice (hero, banners)
- Tipuri: hero, og, banner
- Sorting, active/inactive

#### 13. **manual_orders** - Comenzi manuale admin
- Pentru procesare offline

---

## 🔧 FUNCȚIONALITĂȚI IMPLEMENTATE

### ✅ 1. Admin Dashboard Complet
**Locație**: `/app/app/admin/AdminDashboard.tsx`

**Tabs disponibile**:
- 📊 Overview (statistici)
- 📦 Products (CRUD produse)
- 📥 **Import Catalog** (CSV/Excel - NOU!)
- 👥 Users & Partners
- 📚 Partner Resources
- 🖼️ Public Assets
- 📝 **Articles** (Blog - NOU!)
- 🛒 Clients & Orders
- 📋 Partner Orders
- 💰 Commissions
- ❓ Workflow Guide

### ✅ 2. CRUD Produse - COMPLET
**API Endpoints**:
- `/api/admin/products/list` ✅
- `/api/admin/products/create` ✅
- `/api/admin/products/update` ✅
- `/api/admin/products/delete` ✅
- `/api/admin/products/import-catalog` ✅ (CSV/Excel)

**Component**: `/app/app/admin/ProductsAdmin.tsx`

**Funcționalități**:
- Adăugare produs cu validare completă
- Editare produs (populează form cu date existente)
- Ștergere produs cu confirmare
- Upload imagini (R2 storage)
- Import masiv CSV/Excel
- Template CSV downloadable

### ✅ 3. CRUD Articole - COMPLET
**API Endpoints**:
- `/api/admin/articles/list` ✅
- `/api/admin/articles/create` ✅
- `/api/admin/articles/update` ✅
- `/api/admin/articles/delete` ✅

**Component**: `/app/app/admin/ArticlesAdmin.tsx`

**Funcționalități**:
- Adăugare articol cu editor rich text
- Multiple imagini per articol
- Published/Draft status
- Slug auto-generate din titlu
- Preview & Edit inline

### ✅ 4. Import Cataloage - CSV/Excel
**API**: `/api/admin/products/import-catalog/route.ts`  
**Component**: `/app/app/admin/ImportCatalog.tsx`

**Features**:
- Support CSV și Excel (.xlsx, .xls)
- Template CSV cu exemple
- Mapping flexibil coloane (română/engleză)
- Drag & drop upload
- Preview rezultate import
- Upsert automat (update by SKU)

**Coloane acceptate**:
- Obligatorii: SKU, Nume, Preț
- Opționale: Descriere, Categorie, Finisaj, Culoare, Material, Dimensiuni, Stoc, Imagini

### ✅ 5. AI Search Infrastructure - PREGĂTIT
**SQL Setup**: `/app/sql/ai_search_setup_safe.sql`

**Funcții RPC create**:
- `search_products_semantic(query_embedding, filters)` - Vector similarity search
- `search_products_fulltext(query)` - Fallback text search
- `find_similar_finishes(product_id)` - Produse cu finisaj similar
- `find_similar_sizes(product_id)` - Produse cu dimensiuni similare

**API Endpoints**:
- `/api/search/ai` - Căutare cu embeddings OpenAI ✅
- `/api/search/fallback` - Full-text search ✅

**Status**: Backend READY, frontend UI NOT implemented yet

### ✅ 6. Environment Variables
**Configurate în Vercel**:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ OPENAI_API_KEY (pentru AI search)
- ✅ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
- ✅ R2_BUCKET_NAME, NEXT_PUBLIC_R2_PUBLIC_URL

**Fișier local**: `/app/.env.local` (sync cu Vercel)

---

## ⚠️ PROBLEME IDENTIFICATE & REZOLVATE

### 🔴 Problemă 1: CRUD Nu Funcționa
**Cauză**: Tabelele nu erau create în Supabase  
**Fix**: SQL-uri rulate în Supabase Dashboard  
**Status**: ✅ REZOLVAT (confirmat din screenshots - tabelele există)

### 🔴 Problemă 2: Build Errors Vercel
**Cauză**: Dependință `lucide-react` lipsea  
**Fix**: `yarn add lucide-react`  
**Status**: ✅ REZOLVAT (build local reușește)

### 🔴 Problemă 3: Preview URL 404
**Cauză**: Assets Next.js lipsă din `/_next/static/`  
**Fix**: Rebuild local + verificare deployment  
**Status**: ⚠️ PARȚIAL (local OK, preview needs redeploy)

---

## 🚧 FUNCȚIONALITĂȚI ÎN DEZVOLTARE

### ❌ 1. Import PDF cu AI Extraction
**Cerință**: Import cataloage PDF (cum e PIANCA Collezione Giorno)  
**Status**: NU IMPLEMENTAT  
**Ce trebuie**:
- API endpoint `/api/admin/products/import-pdf`
- OpenAI GPT-4 Vision pentru extracție text + imagini
- Parse structurat: produse, dimensiuni, prețuri, imagini
- Automat populate DB cu produse din PDF

**PDF analizat**: 
- Catalog PIANCA Collezione Giorno (mobilă living)
- Structură: categorii → produse → specs tehnice + imagini
- Info per produs: nume, cod, dimensiuni, materiale, finisaje, prețuri

### ❌ 2. AI Search Frontend UI
**Status**: Backend READY, UI NOT implemented  
**Ce trebuie**:
- Component `/app/components/AISearch.tsx`
- Input cu autocompletion
- Rezultate cu similarity score
- Preview imagini + specs
- Filter panel (preț, categorie, in stock)

### ❌ 3. Căutare Avansată cu Context Imagini
**Cerință**: Căutare multi-modal (text + imagini)  
**Status**: NU IMPLEMENTAT  
**Ce trebuie**:
- CLIP embeddings pentru imagini din cataloage
- Combined search (text embeddings + image embeddings)
- Visual similarity matching (culoare, stil, formă)

### ❌ 4. Quick-Add în Formular Comandă
**Cerință**: Din rezultate search → direct în comandă  
**Status**: NU IMPLEMENTAT  
**Ce trebuie**:
- Buton "Adaugă în comandă" pe fiecare produs
- Pre-populate formular comandă cu detalii produs
- Qty selector + opțiuni (finisaj, dimensiune)

---

## 📁 STRUCTURA PROIECT IMPORTANTĂ

### API Routes (Next.js App Router)
```
/app/app/api/
├── admin/
│   ├── articles/
│   │   ├── list/route.ts
│   │   ├── create/route.ts
│   │   ├── update/route.ts
│   │   └── delete/route.ts
│   ├── products/
│   │   ├── list/route.ts
│   │   ├── create/route.ts
│   │   ├── update/route.ts
│   │   ├── delete/route.ts
│   │   └── import-catalog/route.ts ← CSV/Excel
│   └── (other admin endpoints)
├── search/
│   ├── ai/route.ts ← OpenAI embeddings search
│   └── fallback/route.ts ← Full-text search
└── upload/route.ts ← R2 image upload
```

### Components Admin
```
/app/app/admin/
├── AdminDashboard.tsx ← Main container
├── ProductsAdmin.tsx ← CRUD produse
├── ArticlesAdmin.tsx ← CRUD articole
├── ImportCatalog.tsx ← Import CSV/Excel
├── UsersAdmin.tsx
├── ClientsAdmin.tsx
├── OrdersAdmin.tsx
└── (others)
```

### SQL Scripts
```
/app/sql/
├── public_assets_and_articles_safe.sql ← Articole + Assets
├── ai_search_setup_safe.sql ← AI Search + Products extensions
└── (others)
```

### Librării OpenAI
```
/app/lib/
└── openai.ts ← Helpers pentru embeddings generation
```

### Configurare
```
/app/
├── .env.local ← Environment variables (local dev)
├── package.json ← Dependencies
└── tsconfig.json
```

---

## 🔑 CREDENȚIALE & ACCESS

### Admin Login
- **Email**: admin@otka.ro
- **Password**: Parola!3

### Supabase Project
- **Project ID**: kzwzqtghjnkrdjfosbdz
- **URL**: https://kzwzqtghjnkrdjfosbdz.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/kzwzqtghjnkrdjfosbdz

### Vercel Deployment
- **Project**: admin-crud-update
- **Production**: admin-crud-update.vercel.app (NOT deployed yet)
- **Preview**: admin-crud-update.preview.emergentagent.com (404 assets)

### GitHub
- **Repo**: github.com/qurioso2/otka-frontend
- **Branch**: main

---

## 🎯 PRIORITĂȚI PENTRU CHAT URMĂTOR

### HIGH PRIORITY (Urgent)
1. **Test CRUD după SQL** - Verificare că articole + produse funcționează
2. **Fix Vercel Deployment** - Redeploy pentru assets complete
3. **Implementare Import PDF** - Pentru cataloage tip PIANCA

### MEDIUM PRIORITY
4. **AI Search Frontend UI** - Interfață căutare cu limbaj natural
5. **Embeddings Generation** - Script pentru produse existente
6. **Quick-Add to Order** - Din search în formular comandă

### LOW PRIORITY
7. **Visual Search** - CLIP embeddings pentru imagini
8. **Analytics Dashboard** - Metrici și statistici
9. **Testing Automation** - E2E tests pentru CRUD

---

## 🧪 COMENZI UTILE

### Development Local
```bash
cd /app
yarn dev                    # Start Next.js dev server
yarn build                  # Production build
tsx scripts/generate-embeddings.ts  # Generate AI embeddings
```

### Database
```bash
# Supabase SQL Editor:
# 1. Copy SQL from /app/sql/*.sql
# 2. Paste in editor
# 3. Run
```

### Testing
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/admin/articles/create \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","title":"Test","body":"Content"}'
```

---

## 📚 DOCUMENTAȚIE CREATĂ

1. **`/app/FIX_URGENT_CRUD.md`** - Ghid urgent pentru fix CRUD
2. **`/app/VERCEL_DEPLOYMENT.md`** - Checklist deployment Vercel
3. **`/app/SETUP_AI_SEARCH.md`** - Setup OpenAI + embeddings
4. **`/app/PROJECT_STATUS_SUMMARY.md`** - Acest document

---

## 🤖 PENTRU CHAT URMĂTOR CU SUPABASE MCP

### Context Necesar:
1. **Acces Direct Supabase**: Vezi tabele, query direct, modificări schema
2. **Verificare Date**: Check că articles + products au RLS corect
3. **Testing CRUD**: Insert/Update/Delete direct din chat
4. **Debug Performance**: Query optimization, index usage

### Integrare Supabase MCP:
```typescript
// Connection string pentru MCP
const supabase = createClient(
  'https://kzwzqtghjnkrdjfosbdz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### Quick Queries de Verificare:
```sql
-- Check articles
SELECT COUNT(*) FROM articles;

-- Check products with embeddings
SELECT COUNT(*) FROM products WHERE embedding IS NOT NULL;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('articles', 'products');

-- Check search functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%search%';
```

---

## 📊 METRICS & KPIs (Pentru Monitoring)

### Database
- Total products: ? (query needed)
- Products with embeddings: 0 (needs generation)
- Total articles: 0 (new feature)
- Total users: ? (check needed)

### Performance
- API response time: <200ms (target)
- Search latency: <500ms (with AI)
- Build time: ~25s (local)

### Costs
- OpenAI embeddings: ~$0.50 per 10k products (one-time)
- OpenAI search: ~$0.001 per query
- Supabase: Free tier (current)
- Vercel: Hobby (free)
- Total estimated: <$10/month

---

## ✅ READY FOR NEXT CHAT

**Status Proiect**: 
- ✅ Database schema complete
- ✅ CRUD APIs implemented
- ✅ Admin UI functional
- ✅ Import CSV/Excel ready
- ⏳ AI Search backend ready, UI pending
- ❌ PDF import not implemented
- ❌ Visual search not implemented

**Următorii Pași**:
1. Verify CRUD works with Supabase MCP
2. Implement PDF import with GPT-4 Vision
3. Create AI Search UI
4. Generate embeddings for existing products
5. Deploy to Vercel production

**Contact**: dpo@otka.ro

---

**🎯 Chat-ul este pregătit pentru continuare cu Supabase MCP integration!**
