-- Seed 5 demo products (adjust image URLs to your R2 public domain)
insert into public.products (sku, name, slug, condition, price_public_ttc, price_original, price_partner_net, vat_rate, stock_qty, visible, gallery)
values
('SKU-OTKA-001','Canapea Modulară Skandinavia (ex-demo)','canapea-modulara-skandinavia','ex_demo', 3499, 4299, 3299, 19, 3, true, '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"]'::jsonb),
('SKU-OTKA-002','Lustră Pendantă Design Modern (resigilat)','lustra-pendanta-design-modern','resigilat', 1299, 1799, 1199, 19, 2, true, '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500"]'::jsonb),
('SKU-OTKA-003','Masă Dining Lemn Masiv (ex-demo)','masa-dining-lemn-masiv','ex_demo', 2199, 2899, 1999, 19, 4, true, '["https://images.unsplash.com/photo-1549497538-303791108f95?w=500"]'::jsonb),
('SKU-OTKA-004','Fotoliu Accent Tapițat (resigilat)','fotoliu-accent-tapitat','resigilat', 899, 1299, 799, 19, 5, true, '["https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500"]'::jsonb),
('SKU-OTKA-005','Comodă Vintage Industrial (ex-demo)','comoda-vintage-industrial','ex_demo', 1599, 2199, 1399, 19, 6, true, '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500"]'::jsonb),
('SKU-OTKA-006','Plafoniera LED Minimalist (resigilat)','plafoniera-led-minimalist','resigilat', 599, 899, 549, 19, 8, true, '["https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500"]'::jsonb)
on conflict (sku) do nothing;
