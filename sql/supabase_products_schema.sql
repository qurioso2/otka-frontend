-- Products table
create table if not exists public.products (
  id bigserial primary key,
  sku text not null unique,
  name text not null,
  slug text not null unique,
  price_public_ttc numeric not null default 0,
  price_original numeric, -- Prețul original înainte de reducere
  price_partner_net numeric,
  stock_qty integer not null default 0,
  stock_status varchar default 'available' check (stock_status in ('available', 'reserved', 'discontinued', 'pre_order')),
  gallery jsonb,
  visible boolean not null default true,
  brand_id integer,
  category_id integer,
  condition text,
  defect_notes text,
  vat_rate numeric default 19,
  location text,
  warranty_months integer
);

-- Enable RLS
alter table public.products enable row level security;

-- Policy: anon can read only visible items
create policy if not exists public_read_visible_products
on public.products for select
to anon
using (visible = true);

-- Policy: authenticated can read all
create policy if not exists auth_read_all_products
on public.products for select
to authenticated
using (true);

-- Optional: allow upsert by authenticated users (admin)
-- Adjust this to a specific role if needed
create policy if not exists auth_write_products
on public.products for insert to authenticated with check (true);
create policy if not exists auth_update_products
on public.products for update to authenticated using (true) with check (true);
