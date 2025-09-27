-- Clients + Manual Orders schema and RLS

create table if not exists public.clients (
  id bigserial primary key,
  email text,
  name text,
  company text,
  partner_email text not null,
  created_at timestamptz default now()
);

create table if not exists public.manual_orders (
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

create table if not exists public.partner_agreements (
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

alter table public.clients enable row level security;
alter table public.manual_orders enable row level security;
alter table public.partner_agreements enable row level security;

-- Policies: admin full access; partner sees own
create policy clients_admin_all on public.clients for all to authenticated using (exists(select 1 from public.users u where u.email=auth.email() and u.role='admin')) with check (true);
create policy clients_partner_rw on public.clients for select to authenticated using (partner_email = auth.email());
create policy clients_partner_ins on public.clients for insert to authenticated with check (partner_email = auth.email());
create policy clients_partner_upd on public.clients for update to authenticated using (partner_email = auth.email()) with check (partner_email = auth.email());

create policy orders_admin_all on public.manual_orders for all to authenticated using (exists(select 1 from public.users u where u.email=auth.email() and u.role='admin')) with check (true);
create policy orders_partner_rw on public.manual_orders for select to authenticated using (partner_email = auth.email());
create policy orders_partner_ins on public.manual_orders for insert to authenticated with check (partner_email = auth.email());
create policy orders_partner_upd on public.manual_orders for update to authenticated using (partner_email = auth.email()) with check (partner_email = auth.email());

create policy agreements_admin_all on public.partner_agreements for all to authenticated using (exists(select 1 from public.users u where u.email=auth.email() and u.role='admin')) with check (true);
create policy agreements_self_ins on public.partner_agreements for insert to authenticated with check (email = auth.email());
create policy agreements_self_sel on public.partner_agreements for select to authenticated using (email = auth.email());
-- END
