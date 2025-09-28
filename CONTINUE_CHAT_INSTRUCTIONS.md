# Instrucțiuni pentru Continuarea Implementării OTKA.ro în Alt Chat

## 📋 PROMPT PENTRU NOUL CHAT

```
Salut! Vreau să continui implementarea platformei OTKA.ro (eCommerce mobilier + parteneriate B2B). 

**Context Rapid:**
- Site pentru mobilier, corpuri iluminat, obiecte decorative
- 3 roluri: Guest, Partner, Admin  
- Tech stack: Next.js 15, Supabase, Tailwind, TypeScript
- Sprint 1 COMPLET ✅, acum încep Sprint 2

**Status Curent:**
- Homepage funcțională cu produse mobilier
- Formular partener complet cu validare
- Build stabil: 44/44 pagini generate
- Schema DB pentru comenzi pregătită (dar UI dezactivat)

**Sprint 2 - Următorul Obiectiv:**
Implementează Dashboard Comenzi pentru Parteneri:
1. Reactivează sistemul de comenzi (API-uri există)
2. UI pentru upload comenzi (CSV + manual)  
3. Workflow comenzi: draft → submitted → approved → delivered
4. Dashboard cu lista comenzilor + status tracking

**Fișiere Importante:**
- `/app/PRD.md` - Product Requirements Document complet
- `/app/sql/partner_orders_system.sql` - Schema comenzi (de rulat în Supabase)
- `/app/app/api/partners/orders/route.ts.disabled` - API-uri dezactivate
- `/app/app/parteneri/orders.disabled/` - UI dezactivat

**Cerința Specifică:**
Reactivează și finalizează sistemul de comenzi parteneri conform PRD-ului. Start cu reactivarea API-urilor și crearea UI-ului pentru dashboard comenzi.

Poți să continui de unde am rămas?
```

## 🔧 PAȘI TEHNICI PENTRU CONTINUARE

### 1. **Verifică Status Curent**
```bash
cd /app
yarn build  # Verifică că build-ul funcționează
```

### 2. **Studiază Documentația**
- Citește `/app/PRD.md` pentru cerințe complete
- Verifică schema DB din `/app/sql/partner_orders_system.sql`
- Explorează API-urile din `/app/app/api/partners/orders.disabled/`

### 3. **Reactivează Sistemul Comenzi**
```bash
# Redenumește fișierele dezactivate
mv app/api/partners/orders.disabled app/api/partners/orders
mv app/api/partners/resources.disabled app/api/partners/resources  
mv app/parteneri/orders.disabled app/parteneri/orders
```

### 4. **Rulează Schema în Supabase**
Execută `/app/sql/partner_orders_system.sql` în Supabase SQL Editor

### 5. **Testing și Validare**
```bash
./scripts/test-sprint1.sh  # Script de testing existent
```

## 📊 STAREA ACTUALĂ A IMPLEMENTĂRII

### ✅ COMPLET (Sprint 1)
- Frontend responsive și functional
- Formular partener cu validare completă
- API endpoints pentru comenzi (dezactivate)
- Schema DB completă pentru comenzi
- Testing framework pregătit

### 🔄 URMĂTORUL SPRINT (Sprint 2)
**PRIORITATE 1: Dashboard Comenzi Parteneri**
- Reactivare API-uri existente
- UI pentru lista comenzilor 
- Upload comenzi (CSV + manual)
- Status tracking workflow

**PRIORITATE 2: Resurse Parteneri**
- Acces la cataloage PDF
- Liste de prețuri actualizate
- Imagini și materiale marketing

### 📁 STRUCTURA PROIECTULUI

```
/app/
├── PRD.md                              # ← CITEȘTE PRIMUL
├── sql/
│   └── partner_orders_system.sql       # ← Schema de rulat în Supabase
├── app/
│   ├── api/partners/
│   │   ├── orders.disabled/            # ← Reactivează
│   │   └── resources.disabled/         # ← Reactivează  
│   └── parteneri/
│       └── orders.disabled/            # ← Reactivează
└── scripts/
    └── test-sprint1.sh                 # ← Script testing
```

## 🎯 REZULTATE AȘTEPTATE SPRINT 2

1. **Partner Dashboard Funcțional** - listă comenzi cu status
2. **Upload Comenzi** - formular + CSV import  
3. **Workflow Status** - draft → submitted → approved → delivered
4. **Resurse Parteneri** - acces la cataloage și liste prețuri
5. **Testing Complet** - toate funcționalitățile validate

## ⚠️ NOTE IMPORTANTE

- **Build-ul este stabil** - nu modifica fișierele core fără backup
- **API-urile există** dar sunt dezactivate pentru stabilitate
- **Schema DB e pregătită** - doar rulează SQL-ul în Supabase
- **Folosește testing script-ul** pentru validare continuă

**Baftă cu Sprint 2! 🚀**