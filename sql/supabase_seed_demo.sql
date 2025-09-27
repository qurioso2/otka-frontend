-- SEED DEMO FOR OTKA
-- Run AFTER supabase_master_setup.sql

-- 1) Create/replace a public view without price_partner_net
create or replace view public.products_public as
select id, sku, name, slug, price_public_ttc, stock_qty, gallery, visible
from public.products
where visible = true;

-- 2) Seed admin + partners (adjust emails before running)
insert into public.users (email, role, partner_status, company_name, contact_name, phone)
values
  ('admin@otka.ro','admin','active','MERCURY VC S.R.L.','Admin OTKA','+40 7xx xxx xxx'),
  ('partner.active@otka.ro','partner','active','Partner Active SRL','Ion Popescu','+40 7xx xxx xxx'),
  ('partner.pending@otka.ro','partner','pending','Partner Pending SRL','Maria Ionescu','+40 7xx xxx xxx')
on conflict (email) do nothing;

-- 3) (Optional) Seed a couple of products public – uncomment to use
-- insert into public.products (sku, brand_id, category_id, name, slug, condition, price_public_ttc, price_partner_net, vat_rate, stock_qty, visible, gallery)
-- values
-- ('SKU-DEMO-1', null, null, 'MacBook Air 13 (resigilat)', 'macbook-air-13-resigilat', 'resigilat', 3499, 3299, 19, 3, true, '["https://cdn.otka.ro/demo1.jpg"]'::jsonb),
-- ('SKU-DEMO-2', null, null, 'iPhone 14 (ex demo)', 'iphone-14-ex-demo', 'ex_demo', 2999, 2799, 19, 1, true, '["https://cdn.otka.ro/demo2.jpg"]'::jsonb)
-- on conflict (sku) do nothing;

-- END
