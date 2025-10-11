# OTKA Quote Management System (QMS) — AI Search + Offers + Orders

Date: 11 Oct 2025
Owner: OTKA (admin-crud-update)
Scope: B2B partner quoting, offer generation, and split-order orchestration

---

## 1) Executive Summary

We will build a Quote Management System that enables partners to search products using natural language and images, configure items (finishes, custom sizes, options), compile a draft list, generate branded offers, and convert accepted offers into orders automatically split per producer. Pricing rules will handle two partner types (5% commission vs. reseller with producer-specific discounts), and shipping will be applied according to partner type and destination.

Delivery strategy is incremental, in five focused phases:
- Phase 1: AI Search (text + image-assisted) UI + endpoints
- Phase 2: Quote Draft (configurable products, pricing preview)
- Phase 3: Offer Generation (PDF, branding, history)
- Phase 4: Orders Orchestration (split per producer, statuses, emails)
- Phase 5: Pricing Engine & Policies (commission vs. discount, shipping rules)
- Phase 6: QA, Observability, and Polish

This plan leverages existing Supabase schema (products, articles, users) and AI Search backend (RPC functions) already prepared, adding the missing UI and new domain models (quotes, offers, orders) with robust RLS.

---

## 2) Objectives

- Provide fast, relevant AI-powered product discovery via text or image-assisted queries
- Allow partners to compile and edit a configurable product list (draft quote)
- Generate branded, shareable offers (PDF/HTML) with partner header and terms
- Convert accepted offers into orders, splitting items by producer/brand automatically
- Enforce partner pricing rules (commission vs. discount) and shipping policies
- Maintain full audit history and searchable archive of offers and orders

KPIs
- Search-to-add rate > 50% (users add an item from search results)
- Offer creation time < 3 minutes for 5+ items
- Offer acceptance-to-order conversion > 40%
- Zero data leakage across tenants due to strict RLS

---

## 3) UI/UX Design Guidelines

Foundations
- Typography: Headings Montserrat, body Figtree (web-safe, modern, readable)
- Theme: Light/dark support by system preference with in-app toggle
- Color palette: Primary violet/indigo family for CTAs (aligns with existing admin accents), neutrals for surfaces, semantic variants for success/warning/error. Use Tailwind tokens (e.g., violet-600/700; emerald-600 for success; amber-600 for warnings; rose-600 for errors). Avoid raw hexes.
- Design tokens: spacing, radii, shadows, z-index scales defined via Tailwind theme; no magic numbers

Components
- Use Shadcn/UI primitives (Button, Input, Select, Tabs, Dialog, Sheet, Card, Table, Breadcrumb, Toast/Sonner, Skeleton)
- Icons: lucide-react only
- Every interactive/control element includes data-testid attributes
- State styles: hover, focus-visible, active, disabled, selected, invalid
- Motion: transition on opacity/transform only, 150–200ms; avoid transition: all
- Gradients: max 20% viewport usage; hero/primary CTA only

Data States
- Loading: Skeletons for search results and quote list
- Empty: Helpful prompts (e.g., “Începe cu o căutare sau încarcă o poză”) + primary action
- Error: Clear message + retry action and contact link

Accessibility
- Semantic HTML, keyboard navigability, labels/aria, color contrast AA+

---

## 4) Implementation Steps (Phased)

### Phase 1 — AI Search (Text + Image-Assisted)
Backend
- Extend existing /api/search/ai to accept optional image input path:
  - If image provided, call GPT-4o Vision to extract text descriptors (category, material, color, shape, style, dimensions if visible)
  - Generate text embedding from descriptors using text-embedding-3-small
  - Call search_products_semantic RPC with filters (price range, category, in-stock)
- Add new endpoint /api/search/ai-image (MVP): purely image -> descriptors -> embedding -> vector search
- Add guardrails against oversized images, with server-side downscale if needed

Frontend
- Create components: AISearch (input, upload, filters), AIResultsGrid, FiltersPanel
- Support natural-language queries and drag/drop image; show chips for extracted attributes
- Provide result cards with: thumbnail(s), price public TTC, partner price, key specs, stock, similarity score; actions: “Adaugă în ofertă”
- States: loading skeletons, empty, error, and results

Outputs
- Working AI search UI with text or image-assisted searches
- Ability to add a result directly to draft quote

### Phase 2 — Quote Draft (Configurable Items)
Data model
- tables: quotes, quote_items, quote_item_options
  - quotes: id, partner_id, status (draft/sent/accepted/declined), currency, destination_address, notes, totals (computed), created_at
  - quote_items: id, quote_id, product_id, sku, name, base_price, qty, finish, color, material, size_json (width/length/height/custom), notes, producer_id, subtotal
  - quote_item_options: id, quote_item_id, option_key, option_value, price_delta
- RLS: partners can only access their quotes; admins can access all

Backend
- Endpoints: /api/quotes/create, /api/quotes/get, /api/quotes/update, /api/quotes/add-item, /api/quotes/update-item, /api/quotes/remove-item, /api/quotes/price-preview
- Pricing preview server-side (see Phase 5 engine draft)

Frontend
- QuoteDraft UI (drawer/page): list of items with inline edit: qty, finish/color/material, custom dimensions, notes; per-item and total pricing summary
- Multi-select add from search results; “Salvează draft” and “Trimite spre ofertare”

Outputs
- Partners can compile a draft quote and preview pricing

### Phase 3 — Offer Generation (Branded PDF)
Data model
- offers: id, quote_id, partner_id, number, pdf_url, valid_until, status (sent/viewed/accepted/expired), totals snapshot, created_at

Backend
- Endpoint /api/offers/create-from-quote: generates offer number + branded PDF (partner header), uploads to storage (Supabase Storage/R2) and stores public URL
- Email endpoint /api/offers/send for sending to end-client (use existing mailer; add missing export fix)
- Option to regenerate PDF after edits; maintain versioning
- Lightweight HTML->PDF: @react-pdf/renderer or Playwright print-to-pdf on server (prefer @react-pdf/renderer for Vercel compatibility)

Frontend
- Offer builder/preview page: show customer-facing view, allow download/share; action buttons: Send, Mark as Accepted/Declined

Outputs
- Branded offer PDF generation and delivery

### Phase 4 — Orders & Split per Producer
Data model
- producers (brands): id, name, email, incoterms, lead_time_days, shipping_rules
- orders: id, partner_id, offer_id, status (pending/confirmed/production/shipped/completed), totals, created_at
- order_items: id, order_id, producer_id, product_id, sku, name, qty, agreed_price, item_config_json, notes
- purchase_orders: id, order_id, producer_id, pdf_url, status

Backend
- Endpoint /api/orders/create-from-offer: splits quote items by producer; creates parent order + child purchase orders
- Email per producer with PO attachment and line details
- Status updates with audit trail and webhooks for acknowledgements (future)

Frontend
- Orders list and details; per-producer PO view; status transitions by admin

Outputs
- One-click conversion from accepted offer to orders with per-producer split

### Phase 5 — Pricing Engine & Policies
Rules
- Partner types:
  1) Commission model (5%): Offer shows public TTC; commission is included; shipping included by OTKA; margin tracking for OTKA
  2) Reseller discount: Producer-specific discount off list price; shipping added on proforma depending on destination
- Price modifiers:
  - Options/finishes fees, custom dimension surcharges, special treatments
  - Currency handling and VAT flags

Implementation
- pricing_rules table (producer_id, rule_type, discount_percent, commission_percent, shipping_policy, extras_json)
- compute_price(product_id, qty, options_json, partner_id) RPC to return base, modifiers, shipping, total and explanations
- Server-side validation for every price mutation

Outputs
- Consistent, transparent pricing with clear breakdown

### Phase 6 — QA, Observability, and Polish
- E2E paths: search -> add to draft -> generate offer -> accept -> create orders -> split POs
- Metrics: search latency, offer generation success rate, order split correctness
- Error reporting and admin tools (retries for emails, reprice buttons)

---

## 5) Technical Details

Database (Supabase/Postgres)
- quotes: id uuid pk, partner_id uuid fk(users), status text, currency text, destination_address jsonb, notes text, totals jsonb, created_at timestamptz default now()
- quote_items: id uuid pk, quote_id uuid fk(quotes), product_id uuid fk(products), sku text, name text, producer_id uuid fk(producers), base_price numeric, qty integer, finish text, color text, material text, size_json jsonb, notes text, subtotal numeric
- quote_item_options: id uuid pk, quote_item_id uuid fk(quote_items), option_key text, option_value text, price_delta numeric
- offers: id uuid pk, quote_id uuid fk(quotes), partner_id uuid fk(users), number text unique, pdf_url text, valid_until date, status text, totals jsonb, created_at timestamptz
- producers: id uuid pk, name text unique, email text, incoterms text, lead_time_days int, shipping_rules jsonb
- orders: id uuid pk, partner_id uuid fk(users), offer_id uuid fk(offers), status text, totals jsonb, created_at timestamptz
- order_items: id uuid pk, order_id uuid fk(orders), producer_id uuid fk(producers), product_id uuid fk(products), sku text, name text, qty int, agreed_price numeric, item_config_json jsonb, notes text
- purchase_orders: id uuid pk, order_id uuid fk(orders), producer_id uuid fk(producers), pdf_url text, status text
- pricing_rules: id uuid pk, producer_id uuid fk(producers), rule_type text, discount_percent numeric, commission_percent numeric, shipping_policy jsonb, extras_json jsonb

Indexes & Performance
- Index quotes(partner_id, status), offers(partner_id, status), orders(partner_id, status), order_items(order_id, producer_id)
- Vector index on products.embedding already in place; maintain smaller match_count with server-side ranking

RLS (examples)
- quotes: SELECT/INSERT/UPDATE by partner_id = auth.uid() or email mapping; admins unrestricted
- offers: same as quotes
- orders: partner sees only their orders; admin sees all; producers may be granted read to their POs (future)

APIs (Next.js app router)
- /api/search/ai (extend) — POST { query, image?, filters } -> ranked results
- /api/search/ai-image — POST { image, filters } -> results
- /api/quotes/* — CRUD + add/update/remove item; price-preview
- /api/offers/* — create-from-quote, send, list, get
- /api/orders/* — create-from-offer, list, get, update status
- /api/pricing/preview — compute server-side price breakdown

AI
- Text embeddings: OpenAI text-embedding-3-small (1536d) already used
- Image-assisted search (MVP): GPT-4o Vision to extract textual descriptors from image, then embed
- Future: CLIP image embeddings stored in products for visual similarity

PDF
- @react-pdf/renderer for deterministic server rendering on Vercel; fallback to HTML template + headless print in non-edge runtime

Email
- Use existing mailer.ts; fix missing export (sendZohoMail) or provide mail transport via SMTP

Security
- Never expose service role on client; all pricing and mutations are server-side with auth
- Strict validation of files (size/type), inputs, and RLS coverage

Testing
- Unit tests for pricing engine and RPC
- Integration tests for search endpoints and quote flows
- E2E smoke via Playwright for core funnel

---

## 6) Next Actions (Week 1)
1) Implement /components/AISearch + /api/search/ai-image (image-assisted)
2) Add "Adaugă în ofertă" action: create a draft quote if missing and add items
3) Create tables: quotes, quote_items, quote_item_options (safe SQL + RLS)
4) Quote Draft page with edit controls and server-side price preview
5) Offer creation endpoint + minimal PDF with branding placeholder
6) Define pricing_rules table and initial compute_price RPC (commission vs. discount)

---

## 7) Success Criteria
- Users can perform text and image-assisted searches and add items to a draft
- Draft quotes maintain configurable items with server-validated pricing
- Offers can be generated as branded PDFs and sent to clients
- Converting an accepted offer creates orders and splits items per producer accurately
- Pricing engine correctly applies commission (5%) vs producer-specific discounts with correct shipping handling
- All data access complies with RLS (no cross-tenant leakage), and core funnel E2E passes
