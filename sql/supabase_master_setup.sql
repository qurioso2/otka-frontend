-- MASTER SETUP FOR OTKA (create + hardening)
-- Run this in Supabase SQL Editor. Execute in order.

-- 1) Ensure required tables exist (based on your current schema)
create table if not exists public.users (
  id bigserial primary key,
  role text not null default 'visitor' check (role in ('visitor','partner','admin')),
  company_name text,
  vat_id text,
  contact_name text,
  email text not null unique,
  phone text,
  partner_status text check (partner_status in ('pending','active','suspended')) default 'pending',
  agreed_terms_version text,
  agreed_terms_at timestamptz
);

create table if not exists public.products (
  id bigserial primary key,
  sku text not null unique,
  brand_id bigint,
  category_id bigint,
  name text not null,
  slug text not null unique,
  condition text not null check (condition in ('resigilat','ex_demo')),
  defect_notes text,
  defect_photos jsonb,
  price_public_ttc numeric not null,
  price_partner_net numeric,
  vat_rate numeric not null default 21,
  stock_qty integer not null default 0,
  location text,
  warranty_months integer,
  attachments jsonb,
  gallery jsonb,
  visible boolean not null default true
);

create table if not exists public.catalogs (
  id bigserial primary key,
  brand_id bigint,
  title text not null,
  version text not null,
  file_url text not null,
  valid_from date,
  valid_to date,
  tags jsonb
);

create table if not exists public.materials (
  id bigserial primary key,
  brand_id bigint,
  title text not null,
  files jsonb,
  tags jsonb
);

create table if not exists public.pricelists (
  id bigserial primary key,
  brand_id bigint,
  file_url text not null,
  type text check (type in ('public','partner')),
  currency text,
  version text
);

create table if not exists public.orders (
  id bigserial primary key,
  user_id bigint,
  items jsonb,
  total_net numeric,
  total_vat numeric,
  total_gross numeric,
  status text
);

-- 2) Enable RLS
alter table public.users enable row level security;
alter table public.products enable row level security;
-- (Optional) enable on other tables later as needed

-- 3) Drop existing permissive policies to avoid conflicts
-- USERS
drop policy if exists users_select_auth on public.users;
drop policy if exists users_insert_auth on public.users;
drop policy if exists users_update_auth on public.users;
drop policy if exists users_select_self on public.users;
drop policy if exists users_select_admin on public.users;
drop policy if exists users_update_self on public.users;
drop policy if exists users_update_admin on public.users;
drop policy if exists users_insert_admin on public.users;

-- PRODUCTS
drop policy if exists public_read_visible_products on public.products;
drop policy if exists auth_read_all_products on public.products;
drop policy if exists products_select_anon on public.products;
drop policy if exists products_select_auth on public.products;

-- 4) Hardened policies
-- USERS: 
--  - Auth user poate vedea DOAR propriul profil
--  - Admin poate vedea toți
--  - Auth user poate edita doar propriile câmpuri non-critice (NU rol/status)
--  - Admin poate insera/update orice
create policy users_select_self on public.users
for select to authenticated
using (auth.email() = email);

create policy users_select_admin on public.users
for select to authenticated
using (exists (select 1 from public.users u where u.email = auth.email() and u.role = 'admin'));

create policy users_update_self on public.users
for update to authenticated
using (auth.email() = email)
with check (
  auth.email() = email
  and coalesce(role, 'visitor') = coalesce(old.role, 'visitor')
  and coalesce(partner_status, 'pending') = coalesce(old.partner_status, 'pending')
);

create policy users_update_admin on public.users
for update to authenticated
using (exists (select 1 from public.users u where u.email = auth.email() and u.role = 'admin'))
with check (true);

create policy users_insert_admin on public.users
for insert to authenticated
with check (exists (select 1 from public.users u where u.email = auth.email() and u.role = 'admin'));

-- PRODUCTS:
--  - anon: doar produse vizibile (preț public)
--  - authenticated: poate vedea tot (inclusiv price_partner_net)
create policy products_select_anon on public.products
for select to anon
using (visible = true);

create policy products_select_auth on public.products
for select to authenticated
using (true);

-- 5) (Opțional) seed minimal admin (modificați emailul)
-- insert into public.users (email, role, partner_status) values ('admin@otka.ro','admin','active') on conflict (email) do nothing;

-- END
