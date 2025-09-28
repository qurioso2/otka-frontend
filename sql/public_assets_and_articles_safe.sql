-- SAFE SQL for Supabase: public assets (hero/og/banners) and public articles with multi-images
-- Idempotent: uses IF NOT EXISTS and CREATE OR REPLACE VIEW style where possible

-- Enable pgcrypto for gen_random_uuid if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Public Assets
CREATE TABLE IF NOT EXISTS public.public_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'hero' | 'og' | 'banner'
  title text,
  url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_public_assets_type ON public.public_assets(type);
CREATE INDEX IF NOT EXISTS idx_public_assets_active ON public.public_assets(active);
CREATE INDEX IF NOT EXISTS idx_public_assets_sort ON public.public_assets(sort_order);

-- RLS: allow public read (optional), admin write
ALTER TABLE public.public_assets ENABLE ROW LEVEL SECURITY;

-- Policy: public read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'public_assets' AND policyname = 'Public read public_assets'
  ) THEN
    CREATE POLICY "Public read public_assets" ON public.public_assets
      FOR SELECT USING (true);
  END IF;
END $$;

-- Policy: only admins can write (relies on users table with role='admin')
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'public_assets' AND policyname = 'Admin write public_assets'
  ) THEN
    CREATE POLICY "Admin write public_assets" ON public.public_assets
      FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'public_assets' AND policyname = 'Admin update public_assets'
  ) THEN
    CREATE POLICY "Admin update public_assets" ON public.public_assets
      FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'public_assets' AND policyname = 'Admin delete public_assets'
  ) THEN
    CREATE POLICY "Admin delete public_assets" ON public.public_assets
      FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      );
  END IF;
END $$;

-- 2) Articles with multi-images
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  body text,
  images text[] DEFAULT '{}',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Policy: public read only published
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Public read published articles'
  ) THEN
    CREATE POLICY "Public read published articles" ON public.articles
      FOR SELECT USING (published = true);
  END IF;
END $$;

-- Policy: admin full write
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Admin write articles'
  ) THEN
    CREATE POLICY "Admin write articles" ON public.articles
      FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Admin update articles'
  ) THEN
    CREATE POLICY "Admin update articles" ON public.articles
      FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'articles' AND policyname = 'Admin delete articles'
  ) THEN
    CREATE POLICY "Admin delete articles" ON public.articles
      FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.email = auth.email() AND u.role = 'admin')
      );
  END IF;
END $$;

-- Optional helper view: latest hero & og
CREATE OR REPLACE VIEW public.public_assets_active AS
SELECT DISTINCT ON (type) *
FROM public.public_assets
WHERE active = true
ORDER BY type, sort_order ASC, created_at DESC;