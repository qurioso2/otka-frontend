1. Arhitectura site-ului
Pagina principală (publică)

Header minimalist cu logo „OTKA” (alb/negru, tipografie clean, similar Apple).

Hero section: imagine full-bleed cu mesaj scurt → „Produse resigilate și expuse, cu prețuri avantajoase”.

Listă produse disponibile:

imagine produs (stil card, muchii rotunjite, shadow soft)

titlu + descriere scurtă

stoc (disponibil / rezervat)

preț (fără preț parteneri)

Footer simplu cu linkuri: Termeni, Contact, Login Parteneri.

Zona parteneri (login necesar)

Autentificare simplă (email + parolă, administrată de tine).

Dashboard:

listă produse cu preț parteneri

opțiune descărcare Excel/CSV

informații suplimentare (garanții, discounturi, status stoc).

Logout buton vizibil.

Admin simplu

Upload fișier CSV/Excel (titlu, descriere, imagine, stoc, preț public, preț partener).

Panou intern minimal pentru tine (poți face în Google Sheets integrat → simplu și gratuit).

2. Design & funcționalități
Linie vizuală (stil Apple / Jony Ive)

Font: SF Pro Display sau alternativ Inter.

Culori: alb, gri deschis, negru → contrast minimalist.

Buton call-to-action: rotunjit, simplu (alb pe fundal negru).

Layout: grilă de produse aerisită, spații mari, fără distrageri.

Funcționalități cheie

Public: doar listă produse și descriere → SEO friendly.

Parteneri: login simplu → acces la prețuri nete.

Admin: actualizare produse din Google Sheets → sincronizare automată (prin SheetDB
 sau [Google Sheets API] gratuit).

3. Setup tehnic gratuit

Ai deja:

Domeniu: otka.ro (ROTLD)

Cloudflare: activ (perfect pentru DNS + HTTPS gratuit)

Zoho Mail: email activat

Pași hosting gratuit

Cod sursă (static site):

Folosim Next.js sau Astro (pentru rapiditate și SEO).

Design minimalist cu Tailwind CSS.

2 zone: / (public), /login și /dashboard.

Hosting:

Vercel (gratuit, ideal pentru Next.js, rapid și simplu).

Alternativ: Netlify (tot gratuit).

Conectezi domeniul din Cloudflare → DNS → Vercel/Netlify.

Login Parteneri (gratuit & simplu):

Folosim Clerk.dev
 sau Supabase Auth
 (ambele au plan gratuit).

Doar email+parolă, tu decizi cine are cont.

Bază de date produse:

Varianta cea mai simplă: Google Sheets → conectată prin API → randată în site.

Alternativ: Supabase (gratuit, PostgreSQL).

Admin-ul updatează produsele direct în Sheets → instant vizibile pe site.

4. Instrucțiuni clare

Creezi repo pe GitHub → otka-site.

Rulezi local:

npx create-next-app otka
cd otka
npm install @tailwindcss/forms


Configuri Tailwind și pui layout minimalist.

Conectezi repo la Vercel → deploy automat.

În Cloudflare, setezi CNAME către Vercel.

Activezi Clerk / Supabase Auth pentru login parteneri.

Integrezi Google Sheets pentru listă produse:

Public → doar titlu, imagine, descriere, preț general.

Privat (dashboard) → include și preț partener.
