-- Seed 5 demo products (adjust image URLs to your R2 public domain)
insert into public.products (sku, name, slug, condition, price_public_ttc, price_original, price_partner_net, vat_rate, stock_qty, visible, gallery)
values
('SKU-OTKA-001','MacBook Air 13 M1 (resigilat)','macbook-air-13-m1-resigilat','resigilat', 3499, 4299, 3299, 19, 3, true, '["https://cdn.otka.ro/demo/macbook-air-13.jpg"]'::jsonb),
('SKU-OTKA-002','iPhone 14 Pro (ex demo)','iphone-14-pro-ex-demo','ex_demo', 4499, 5299, 4199, 19, 2, true, '["https://cdn.otka.ro/demo/iphone-14-pro.jpg"]'::jsonb),
('SKU-OTKA-003','iPad Air 10.9 (resigilat)','ipad-air-10-9-resigilat','resigilat', 2699, 3199, 2499, 19, 4, true, '["https://cdn.otka.ro/demo/ipad-air.jpg"]'::jsonb),
('SKU-OTKA-004','Apple Watch Series 8 (ex demo)','apple-watch-series-8-ex-demo','ex_demo', 1599, 1899, 1499, 19, 5, true, '["https://cdn.otka.ro/demo/apple-watch.jpg"]'::jsonb),
('SKU-OTKA-005','AirPods Pro (resigilat)','airpods-pro-resigilat','resigilat', 899, 1199, 829, 19, 10, true, '["https://cdn.otka.ro/demo/airpods-pro.jpg"]'::jsonb)
on conflict (sku) do nothing;
