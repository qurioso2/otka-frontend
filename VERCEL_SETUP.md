# 🚀 Setup Vercel pentru OTKA.ro

## ❌ Problema Identificată
Eroarea de build "Missing Supabase environment variables!" apare pentru că Vercel nu are variabilele necesare.

## ✅ Soluția: Configurarea Variabilelor în Vercel

### Variabile Obligatorii în Vercel Dashboard:

```bash
# Supabase (pentru server-side și build)
SUPABASE_URL=https://kzwzqtghjnkrdjfosbdz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d3pxdGdoam5rcmRqZm9zYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTMwMDEsImV4cCI6MjA3NDIyOTAwMX0.h5EUWHDpcGNnf8N8iz8GLZcr03_QR6tmJCb2I7jPbuY

# Supabase (pentru client-side)
NEXT_PUBLIC_SUPABASE_URL=https://kzwzqtghjnkrdjfosbdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d3pxdGdoam5rcmRqZm9zYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTMwMDEsImV4cCI6MjA3NDIyOTAwMX0.h5EUWHDpcGNnf8N8iz8GLZcr03_QR6tmJCb2I7jPbuY

# R2 Storage
R2_ACCOUNT_ID=9bd60edcdbf30830bd3f2f86cf411052
R2_ACCESS_KEY_ID=8e3095acee1ce139ba7c4a9a0b5110a2
R2_SECRET_ACCESS_KEY=fb24f5a998086c29370eb113e253eaaf60f8dd8b9c14b0468b43f065ed8b63ed
R2_BUCKET_NAME=otka-bucket
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-52df54499f9f4836a88ab79b2ff9f8cb.r2.dev

# Application URLs
NEXT_PUBLIC_URL=https://otka.ro
```

## 🔧 Pași de Configurare:

### 1. Accesează Vercel Dashboard
- Mergi la proiectul OTKA în Vercel
- Clic pe **Settings** → **Environment Variables**

### 2. Adaugă Variabilele
Pentru fiecare variabilă din lista de mai sus:
- Clic **Add New**
- Pune **Key** (ex: `SUPABASE_URL`)
- Pune **Value** (ex: `https://kzwzqtghjnkrdjfosbdz.supabase.co`)
- Selectează **Production**, **Preview**, **Development**
- Clic **Save**

### 3. Redeploy
După adăugarea tuturor variabilelor:
- Mergi la **Deployments**
- Clic **Redeploy** pe ultima versiune

## 🛠️ Modificări Aplicată în Cod:

### ✅ supabaseClient.ts - Compatibilitate Duală
```typescript
// Support both client-side (NEXT_PUBLIC_) and server-side variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
```

### ✅ sitemap.xml/route.ts - Build Safety
```typescript
// Only try to connect to Supabase if variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  // Try to fetch products
} else {
  // Generate basic sitemap
}
```

## 🎯 Rezultat Așteptat:
După configurarea variabilelor, build-ul va reuși și aplicația va funcționa complet pe Vercel cu:
- ✅ Homepage funcțional
- ✅ Dashboard admin cu contrast corectat  
- ✅ Sistemul de comenzi parteneri (Sprint 2)
- ✅ Sitemap XML generat corect
- ✅ Toate funcționalitățile Supabase

## 📞 Support:
Dacă apar încă probleme după configurarea variabilelor, verifică logs-urile în Vercel Functions pentru erori detaliate.