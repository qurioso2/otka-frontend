# 🚀 Vercel Deployment - Checklist Complet

## ✅ Environment Variables în Vercel

### Verifică că TOATE acestea sunt setate în Vercel Dashboard:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

---

### 📋 Lista Completă de Variabile:

#### 1. Supabase (OBLIGATORIU)
```
SUPABASE_URL=https://kzwzqtghjnkrdjfosbdz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://kzwzqtghjnkrdjfosbdz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **Status**: Deja setate în Vercel (văzut în screenshot)

---

#### 2. OpenAI (OBLIGATORIU pentru AI Search)
```
OPENAI_API_KEY=sk-proj-...
```

✅ **Status**: Ai adăugat în Vercel - PERFECT!

**Unde să obții**: https://platform.openai.com/api-keys

---

#### 3. Cloudflare R2 (OBLIGATORIU pentru upload imagini)
```
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=otka-assets
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

✅ **Status**: Deja setate în Vercel (văzut în screenshot)

**Unde să obții**: Cloudflare Dashboard → R2

---

### 🔍 Verificare Rapidă:

Toate variabilele de mai sus trebuie să fie prezente în:
- ✅ **Production**
- ✅ **Preview** 
- ⚠️ **Development** (opțional, pentru vercel dev)

---

## 📝 Pași pentru Deployment

### Pas 1: Verifică Environment Variables

1. Deschide: https://vercel.com/dashboard
2. Selectează proiectul: `admin-crud-update`
3. Settings → Environment Variables
4. **Verifică** că toate cele de mai sus sunt setate
5. **Important**: Asigură-te că `OPENAI_API_KEY` este setat corect!

---

### Pas 2: Rulează SQL Setup în Supabase

**IMPORTANT**: Fă asta ÎNAINTE de deployment!

1. Deschide Supabase Dashboard: https://supabase.com/dashboard
2. Selectează proiectul: `kzwzqtghjnkrdjfosbdz`
3. SQL Editor → New query
4. Copiază conținutul din: `/app/sql/ai_search_setup_safe.sql`
5. **Run** → Verifică că nu sunt erori
6. Ar trebui să vezi mesaje verzi `✓` confirmând succesul

**Erori posibile**:
- `extension "vector" does not exist` → Enable pgvector în Database > Extensions
- Alte erori cu coloane → SQL-ul e SAFE și va ignora ce există deja

---

### Pas 3: Push la Git și Deploy

```bash
# Verifică status
git status

# Add toate modificările
git add .

# Commit
git commit -m "Add AI Search + Import Catalog functionality"

# Push la GitHub (Vercel va detecta automat)
git push origin main
```

**SAU** manual în Vercel:
1. Vercel Dashboard → Deployments
2. Click "Redeploy" pe ultima deployment

---

### Pas 4: Generează Embeddings (După Deploy)

**IMPORTANT**: Fă asta DUPĂ ce aplicația e deployed!

**Opțiunea A - Din Local (Recomandat pentru prima dată)**:
```bash
cd /app
tsx scripts/generate-embeddings.ts
```

**Opțiunea B - Crează endpoint admin pentru generare**:
- Creează `/api/admin/generate-embeddings` (poate fi adăugat ulterior)
- Rulează din interfață admin

---

### Pas 5: Testare Post-Deployment

#### Test 1: Verifică că site-ul se încarcă
```
https://admin-crud-update.vercel.app
```

#### Test 2: Testează CRUD produse
1. Login ca admin
2. Produse → Adaugă produs → Salvează
3. Editează produs → Actualizează
4. Șterge produs → Confirmă

#### Test 3: Testează Import Catalog
1. Admin → Import Catalog
2. Descarcă template CSV
3. Încarcă un fișier test
4. Verifică că produsele apar în listă

#### Test 4: Testează AI Search (când UI-ul e gata)
```bash
curl -X POST https://admin-crud-update.vercel.app/api/search/ai \
  -H "Content-Type: application/json" \
  -d '{"query":"canapea neagră","filters":{"limit":5}}'
```

Așteptat: JSON cu produse și similarity scores

---

## ⚠️ Troubleshooting

### Eroare: "OPENAI_API_KEY is not set"
**Fix**:
1. Verifică în Vercel → Settings → Environment Variables
2. Asigură-te că e setat pentru Production + Preview
3. **Redeploy** după adăugare (IMPORTANT!)

---

### Eroare: "Failed to upload to R2"
**Fix**:
1. Verifică că toate `R2_*` variabilele sunt setate
2. Verifică că R2 bucket-ul `otka-assets` există în Cloudflare
3. Verifică că Access Key are permisiuni de write

---

### Eroare: "Supabase connection failed"
**Fix**:
1. Verifică că `SUPABASE_SERVICE_ROLE_KEY` e setat corect
2. Verifică că RLS policies permit access
3. Verifică în Supabase logs: Dashboard → Logs

---

### Deployment reușit dar features nu funcționează
**Fix**:
1. Verifică browser console pentru erori frontend
2. Verifică Vercel logs: Dashboard → Deployments → Latest → Runtime Logs
3. Verifică că toate variabilele de environment sunt setate

---

## 📊 Monitoring Post-Deployment

### Vercel Logs
```
Vercel Dashboard → Deployments → Latest → Runtime Logs
```

### Supabase Logs
```
Supabase Dashboard → Logs → API Logs
```

### OpenAI Usage
```
https://platform.openai.com/usage
```
Monitorizează costurile (ar trebui să fie <$5/lună)

---

## 🔒 Securitate - Checklist Final

- ✅ Niciun API key în cod (toate în env vars)
- ✅ `.env.local` e în `.gitignore`
- ✅ Folosești `NEXT_PUBLIC_*` DOAR pentru valori safe (URL-uri publice)
- ✅ Secrets (API keys, service role keys) NU au `NEXT_PUBLIC_` prefix
- ⚠️ **NU** face commit la `.env.local` în Git!

---

## 📈 Next Steps După Deployment

1. **Generează embeddings** pentru produsele existente
2. **Testează AI Search** cu query-uri reale
3. **Monitorizează costuri** OpenAI (ar trebui minimale)
4. **Import cataloage** de la furnizori
5. **Creează UI pentru AI Search** (când backend-ul funcționează)

---

## ✅ Deployment Ready Checklist

Înainte de deploy, verifică:

- [ ] Toate environment variables setate în Vercel
- [ ] SQL setup rulat în Supabase (ai_search_setup_safe.sql)
- [ ] Git commit făcut cu toate modificările
- [ ] .env.local NU e în Git
- [ ] Ai OpenAI API key valid (testat local)
- [ ] R2 bucket există și e accesibil

**Când toate sunt bifate** → **PUSH LA GIT** → Vercel va deploye automat! 🚀

---

## 📞 Support

Probleme după deployment?
1. Check Vercel Runtime Logs
2. Check Supabase API Logs  
3. Check Browser Console
4. Email: dpo@otka.ro

---

**🎉 Gata pentru deployment! Push la Git și verifică în Vercel!**
