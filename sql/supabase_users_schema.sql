-- Minimal users table aligned with app needs
create table if not exists public.users (
  id bigserial primary key,
  email text not null unique,
  role text not null default 'visitor' check (role in ('visitor','partner','admin')),
  partner_status text default 'pending' check (partner_status in ('pending','active','suspended')),
  company_name text,
  vat_id text,
  contact_name text,
  phone text,
  agreed_terms_version text,
  agreed_terms_at timestamptz
);

alter table public.users enable row level security;

-- Minimal permissive policies (to be hardened later)
create policy if not exists users_select_auth on public.users for select to authenticated using (true);
create policy if not exists users_insert_auth on public.users for insert to authenticated with check (true);
create policy if not exists users_update_auth on public.users for update to authenticated using (true) with check (true);
