-- =====================================================
-- OTKA.ro - SIMPLE Schema Update for Shipping Addresses
-- =====================================================
-- Simplified version - adds columns directly
-- Ignores errors if columns already exist
-- Run this in Supabase SQL Editor
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

-- Add company field to clients if missing
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS company VARCHAR(200);

-- Add reg_com field to clients if missing
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS reg_com VARCHAR(100);

-- Migrate existing address data to billing_address (if address column exists)
UPDATE public.clients 
SET billing_address = address
WHERE address IS NOT NULL 
  AND billing_address IS NULL;

-- Success!
SELECT '✅ Schema update complete! All fields ready.' as status;
