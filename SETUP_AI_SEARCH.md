# 🚀 Setup AI Search - Ghid Rapid

## Pași pentru Activare Căutare AI

### ✅ Pas 1: Obține OpenAI API Key

1. **Mergi la**: https://platform.openai.com/api-keys
2. **Creează cont** (dacă nu ai deja)
3. **Click "Create new secret key"**
4. **Copiază key-ul** (începe cu `sk-proj-...` sau `sk-...`)
5. **Salvează-l într-un loc sigur** (nu-l mai poți vedea după!)

**💰 Cost**: ~$0.50 pentru 10,000 produse (foarte mic!)

---

### ✅ Pas 2: Configurează Environment Variables

Editează `/app/.env.local` și adaugă:

```bash
# OpenAI API Key pentru embeddings
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Important**: Înlocuiește `sk-proj-your-actual-key-here` cu key-ul tău real!

---

### ✅ Pas 3: Rulează SQL Setup în Supabase

1. **Deschide Supabase Dashboard**: https://supabase.com/dashboard
2. **Selectează proiectul tău** (kzwzqtghjnkrdjfosbdz)
3. **Mergi la SQL Editor** (din meniul stâng)
4. **Click "New query"**
5. **Copiază tot conținutul** din fișierul:
   ```
   /app/sql/ai_search_setup_safe.sql
   ```
6. **Lipește în editor** și **Click "Run"**

**Așteptat**: Vei vedea mesaje verzi `✓` confirmând că totul e gata.

**Erori posibile**:
- Dacă primești eroare `extension "vector" does not exist`:
  - Mergi la **Database > Extensions**
  - Caută **pgvector** și click **Enable**
  - Apoi rulează SQL-ul din nou

---

### ✅ Pas 4: Generează Embeddings pentru Produse Existente

În terminal, din directorul `/app`:

```bash
# Instalează tsx dacă nu e deja (ar trebui să fie)
yarn add -D tsx

# Rulează scriptul de generare embeddings
tsx scripts/generate-embeddings.ts
```

**Așteptat**: 
```
🚀 Starting embedding generation...
📦 Found X products without embeddings

Processing: Canapea Moderna...
  ✅ Generated embedding
Processing: Fotoliu Scandinav...
  ✅ Generated embedding

📊 Summary:
  ✅ Success: X
  ❌ Errors: 0
```

**Timp estimat**: ~1-2 secunde per produs (cu rate limiting)

---

### ✅ Pas 5: Restart Next.js Server

```bash
# Oprește procesul curent (Ctrl+C dacă rulează în foreground)
# Sau:
pkill -f "next dev"

# Start server
cd /app
yarn dev
```

---

## 🧪 Testare

### Test 1: Verifică că API-ul funcționează

```bash
curl -X POST http://localhost:3000/api/search/ai \
  -H "Content-Type: application/json" \
  -d '{"query":"canapea neagră pentru living","filters":{"limit":5}}'
```

**Așteptat**: JSON cu lista de produse și similarity scores.

---

### Test 2: Testează din interfață (când UI-ul e gata)

1. Mergi la pagina principală
2. Caută: "canapea extensibilă gri 3 locuri"
3. Ar trebui să vezi produse relevante ordonate după similaritate

---

## 📁 Fișiere Create

- ✅ `/app/sql/ai_search_setup_safe.sql` - SQL setup (SAFE, verifică schema)
- ✅ `/app/app/api/search/ai/route.ts` - API endpoint căutare AI
- ✅ `/app/app/api/search/fallback/route.ts` - Fallback full-text search
- ✅ `/app/lib/openai.ts` - Helper functions OpenAI
- ✅ `/app/scripts/generate-embeddings.ts` - Script generare embeddings

---

## 🆘 Troubleshooting

### Eroare: "OPENAI_API_KEY is not set"
- Verifică că ai adăugat key-ul în `.env.local`
- Restart server după adăugare

### Eroare: "extension vector does not exist"
- Enable pgvector în Supabase Dashboard > Database > Extensions

### Eroare: "column description does not exist"
- Folosește `ai_search_setup_safe.sql` în loc de `ai_search_setup.sql`
- Acesta verifică schema înainte să adauge coloane

### Embedding generation lent
- Normal: ~50ms per produs (rate limiting OpenAI)
- Pentru 100 produse: ~5 secunde
- Pentru 1000 produse: ~50 secunde

### Căutarea nu returnează rezultate
- Verifică că embeddings au fost generate: 
  ```sql
  SELECT COUNT(*) FROM products WHERE embedding IS NOT NULL;
  ```
- Ar trebui să fie > 0

---

## 🎯 Next Steps (după setup)

1. **Creează UI components** pentru căutare AI
2. **Testează cu query-uri reale**
3. **Ajustează threshold-ul** de similaritate (default: 0.7)
4. **Monitorizează costuri** OpenAI (foarte mici, dar good to know)

---

## 💰 Costuri Estimate OpenAI

| Operație | Cost | Frecvență |
|----------|------|-----------|
| Generare 1 embedding | $0.00002 | La adăugare produs |
| Căutare (1 query) | $0.00002 | Per search |
| 10,000 produse init | ~$0.50 | O singură dată |
| 1000 căutări/zi | ~$0.60/lună | Ongoing |

**Total estimat**: **<$5/lună** pentru trafic mediu

---

## 📞 Support

Dacă întâmpini probleme:
1. Verifică logs: `tail -f /tmp/nextjs.log`
2. Verifică Supabase logs în Dashboard
3. Testează API-ul direct cu curl (vezi mai sus)

**Email**: dpo@otka.ro
