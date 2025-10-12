-- =====================================================
-- OTKA.ro - Schema Update for Shipping Addresses
-- =====================================================
-- Adds shipping address fields to proforme and clients tables
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add shipping address fields to proforme table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'proforme' 
    AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE public.proforme 
      ADD COLUMN shipping_address TEXT,
      ADD COLUMN shipping_city VARCHAR(100),
      ADD COLUMN shipping_county VARCHAR(100);
    
    RAISE NOTICE 'Shipping address fields added to proforme table';
  ELSE
    RAISE NOTICE 'Shipping address fields already exist in proforme table';
  END IF;
END $$;

-- Add shipping address fields to clients table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'billing_address'
  ) THEN
    ALTER TABLE public.clients 
      ADD COLUMN billing_address TEXT,
      ADD COLUMN billing_city VARCHAR(100),
      ADD COLUMN billing_county VARCHAR(100),
      ADD COLUMN shipping_address TEXT,
      ADD COLUMN shipping_city VARCHAR(100),
      ADD COLUMN shipping_county VARCHAR(100);
    
    -- Migrate existing address data to billing_address
    UPDATE public.clients 
    SET billing_address = address
    WHERE address IS NOT NULL AND billing_address IS NULL;
    
    RAISE NOTICE 'Address fields split into billing and shipping in clients table';
  ELSE
    RAISE NOTICE 'Billing/shipping address fields already exist in clients table';
  END IF;
END $$;

-- Add company field to clients if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'company'
  ) THEN
    ALTER TABLE public.clients 
      ADD COLUMN company VARCHAR(200);
    
    RAISE NOTICE 'Company field added to clients table';
  ELSE
    RAISE NOTICE 'Company field already exists in clients table';
  END IF;
END $$;

-- Add reg_com field to clients if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'reg_com'
  ) THEN
    ALTER TABLE public.clients 
      ADD COLUMN reg_com VARCHAR(100);
    
    RAISE NOTICE 'Reg_com field added to clients table';
  ELSE
    RAISE NOTICE 'Reg_com field already exists in clients table';
  END IF;
  
  -- Final success message
  RAISE NOTICE '✅ Schema update complete! All fields are ready.';
END $$;
