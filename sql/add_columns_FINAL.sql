-- =====================================================
-- OTKA.ro - ULTRA SIMPLE Schema Update
-- =====================================================
-- Just adds columns, no data migration
-- 100% SAFE - Run in Supabase SQL Editor
-- =====================================================

-- Add shipping address fields to proforme table
ALTER TABLE public.proforme 
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_county VARCHAR(100);

-- Add billing and shipping address fields to clients table
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS billing_county VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_county VARCHAR(100);

-- Add company field to clients
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS company VARCHAR(200);

-- Add reg_com field to clients
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS reg_com VARCHAR(100);

-- Success message
SELECT '✅ All columns added successfully!' as status;
