-- CLIENTS + MANUAL ORDERS + PARTNER AGREEMENTS SCHEMA - VERSIUNE SAFE
-- Această versiune include cleanup pentru a evita conflictele

-- 0) CLEANUP - Eliminăm policy-urile existente pentru a evita conflictele
DROP POLICY IF EXISTS "clients_admin_all" ON public.clients;
DROP POLICY IF EXISTS "clients_partner_rw" ON public.clients;
DROP POLICY IF EXISTS "clients_partner_ins" ON public.clients;
DROP POLICY IF EXISTS "clients_partner_upd" ON public.clients;

DROP POLICY IF EXISTS "orders_admin_all" ON public.manual_orders;
DROP POLICY IF EXISTS "orders_partner_rw" ON public.manual_orders;
DROP POLICY IF EXISTS "orders_partner_ins" ON public.manual_orders;
DROP POLICY IF EXISTS "orders_partner_upd" ON public.manual_orders;

DROP POLICY IF EXISTS "agreements_admin_all" ON public.partner_agreements;
DROP POLICY IF EXISTS "agreements_self_ins" ON public.partner_agreements;
DROP POLICY IF EXISTS "agreements_self_sel" ON public.partner_agreements;

-- 1) Tabel pentru clienții partenerilor
CREATE TABLE IF NOT EXISTS public.clients (
  id bigserial primary key,
  email text,
  name text,
  company text,
  partner_email text not null,
  created_at timestamptz default now()
);

-- 2) Tabel pentru comenzile manuale (offline) ale partenerilor
CREATE TABLE IF NOT EXISTS public.manual_orders (
  id bigserial primary key,
  client_id bigint references public.clients(id) on delete set null,
  partner_email text not null,
  total_net numeric not null,
  total_vat numeric default 0,
  total_gross numeric not null,
  status text default 'completed',
  note text,
  created_at timestamptz default now()
);

-- 3) Tabel pentru acordurile de parteneriat semnate
CREATE TABLE IF NOT EXISTS public.partner_agreements (
  id bigserial primary key,
  email text not null,
  version text not null,
  accepted_at timestamptz default now(),
  ip text,
  doc_hash text,
  pdf_url text,
  accept_terms boolean,
  accept_gdpr boolean,
  confirm_data boolean
);

-- 4) Activează RLS pe toate tabelele
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_agreements ENABLE ROW LEVEL SECURITY;

-- 5) Policies pentru tabelul CLIENTS
-- Admin poate face orice
CREATE POLICY "clients_admin_all" ON public.clients 
  FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')) 
  WITH CHECK (true);

-- Partenerii pot vedea doar clienții lor
CREATE POLICY "clients_partner_rw" ON public.clients 
  FOR SELECT TO authenticated 
  USING (partner_email = auth.email());

-- Partenerii pot adăuga clienți doar pe numele lor
CREATE POLICY "clients_partner_ins" ON public.clients 
  FOR INSERT TO authenticated 
  WITH CHECK (partner_email = auth.email());

-- Partenerii pot actualiza doar clienții lor
CREATE POLICY "clients_partner_upd" ON public.clients 
  FOR UPDATE TO authenticated 
  USING (partner_email = auth.email()) 
  WITH CHECK (partner_email = auth.email());

-- 6) Policies pentru tabelul MANUAL_ORDERS
-- Admin poate face orice
CREATE POLICY "orders_admin_all" ON public.manual_orders 
  FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')) 
  WITH CHECK (true);

-- Partenerii pot vedea doar comenzile lor
CREATE POLICY "orders_partner_rw" ON public.manual_orders 
  FOR SELECT TO authenticated 
  USING (partner_email = auth.email());

-- Partenerii pot adăuga comenzi doar pe numele lor
CREATE POLICY "orders_partner_ins" ON public.manual_orders 
  FOR INSERT TO authenticated 
  WITH CHECK (partner_email = auth.email());

-- Partenerii pot actualiza doar comenzile lor
CREATE POLICY "orders_partner_upd" ON public.manual_orders 
  FOR UPDATE TO authenticated 
  USING (partner_email = auth.email()) 
  WITH CHECK (partner_email = auth.email());

-- 7) Policies pentru tabelul PARTNER_AGREEMENTS
-- Admin poate face orice
CREATE POLICY "agreements_admin_all" ON public.partner_agreements 
  FOR ALL TO authenticated 
  USING (EXISTS(SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')) 
  WITH CHECK (true);

-- Utilizatorii pot adăuga doar acorduri pe email-ul lor
CREATE POLICY "agreements_self_ins" ON public.partner_agreements 
  FOR INSERT TO authenticated 
  WITH CHECK (email = auth.email());

-- Utilizatorii pot vedea doar acordurile lor
CREATE POLICY "agreements_self_sel" ON public.partner_agreements 
  FOR SELECT TO authenticated 
  USING (email = auth.email());

-- 8) Index-uri pentru performanță
CREATE INDEX IF NOT EXISTS idx_clients_partner_email ON public.clients(partner_email);
CREATE INDEX IF NOT EXISTS idx_manual_orders_partner_email ON public.manual_orders(partner_email);
CREATE INDEX IF NOT EXISTS idx_partner_agreements_email ON public.partner_agreements(email);

-- END CLIENTS + MANUAL ORDERS + PARTNER AGREEMENTS SAFE VERSION