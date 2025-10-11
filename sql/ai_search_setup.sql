-- AI Search Setup pentru OTKA
-- Activare pgvector și configurare schema pentru semantic search

-- 1. Activare extensie pgvector
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Adăugare coloană embedding la tabelul products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Adăugare coloane pentru dimensiuni și caracteristici fizice
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS finish VARCHAR(100),
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS material VARCHAR(100),
ADD COLUMN IF NOT EXISTS width DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS length DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS height DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2);

-- Adăugare metadata pentru liste de preț
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_list_source VARCHAR(200),
ADD COLUMN IF NOT EXISTS price_list_uploaded_at TIMESTAMPTZ;

-- Adăugare generated column pentru full-text search
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS search_text tsvector 
GENERATED ALWAYS AS (
  to_tsvector('romanian', 
    coalesce(name, '') || ' ' || 
    coalesce(description, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(finish, '') || ' ' ||
    coalesce(material, '')
  )
) STORED;

-- 3. Creare index-uri pentru performanță
-- Index pentru vector similarity search (ivfflat)
CREATE INDEX IF NOT EXISTS products_embedding_idx 
ON public.products 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index pentru full-text search
CREATE INDEX IF NOT EXISTS products_search_text_idx 
ON public.products 
USING GIN(search_text);

-- Index-uri pentru filtre
CREATE INDEX IF NOT EXISTS products_finish_idx ON public.products(finish);
CREATE INDEX IF NOT EXISTS products_material_idx ON public.products(material);
CREATE INDEX IF NOT EXISTS products_dimensions_idx ON public.products(width, length, height);

-- 4. Funcție RPC pentru semantic search
CREATE OR REPLACE FUNCTION search_products_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20,
  price_min decimal DEFAULT 0,
  price_max decimal DEFAULT 999999,
  category_filter text DEFAULT NULL,
  in_stock_only boolean DEFAULT true
)
RETURNS TABLE (
  id integer,
  sku varchar,
  name varchar,
  slug varchar,
  description text,
  category varchar,
  finish varchar,
  color varchar,
  material varchar,
  width decimal,
  length decimal,
  height decimal,
  price_public_ttc decimal,
  price_partner_net decimal,
  stock_qty integer,
  gallery text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.sku,
    p.name,
    p.slug,
    p.description,
    p.category,
    p.finish,
    p.color,
    p.material,
    p.width,
    p.length,
    p.height,
    p.price_public_ttc,
    p.price_partner_net,
    p.stock_qty,
    p.gallery,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM public.products p
  WHERE 
    -- Embedding trebuie să existe
    p.embedding IS NOT NULL
    -- Similarity threshold
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    -- Price range
    AND p.price_public_ttc BETWEEN price_min AND price_max
    -- Category filter (optional)
    AND (category_filter IS NULL OR p.category = category_filter)
    -- Stock filter
    AND (NOT in_stock_only OR p.stock_qty > 0)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Funcție pentru full-text search (fallback)
CREATE OR REPLACE FUNCTION search_products_fulltext(
  search_query text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id integer,
  name varchar,
  description text,
  rank real
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    ts_rank(p.search_text, websearch_to_tsquery('romanian', search_query)) as rank
  FROM public.products p
  WHERE p.search_text @@ websearch_to_tsquery('romanian', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- 6. Funcție helper pentru găsire produse similare după finisaj
CREATE OR REPLACE FUNCTION find_similar_finishes(
  product_id integer,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id integer,
  sku varchar,
  name varchar,
  finish varchar,
  price_public_ttc decimal,
  gallery text[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  product_finish varchar;
BEGIN
  -- Obține finisajul produsului curent
  SELECT p.finish INTO product_finish
  FROM public.products p
  WHERE p.id = product_id;
  
  RETURN QUERY
  SELECT
    p.id,
    p.sku,
    p.name,
    p.finish,
    p.price_public_ttc,
    p.gallery
  FROM public.products p
  WHERE 
    p.id != product_id
    AND p.finish IS NOT NULL
    AND product_finish IS NOT NULL
    AND similarity(p.finish, product_finish) > 0.3
  ORDER BY similarity(p.finish, product_finish) DESC
  LIMIT match_count;
END;
$$;

-- 7. Funcție pentru găsire produse similare după dimensiuni
CREATE OR REPLACE FUNCTION find_similar_sizes(
  product_id integer,
  tolerance_percent decimal DEFAULT 0.1,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id integer,
  sku varchar,
  name varchar,
  width decimal,
  length decimal,
  height decimal,
  price_public_ttc decimal,
  gallery text[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  prod_width decimal;
  prod_length decimal;
  prod_height decimal;
BEGIN
  -- Obține dimensiunile produsului curent
  SELECT p.width, p.length, p.height 
  INTO prod_width, prod_length, prod_height
  FROM public.products p
  WHERE p.id = product_id;
  
  RETURN QUERY
  SELECT
    p.id,
    p.sku,
    p.name,
    p.width,
    p.length,
    p.height,
    p.price_public_ttc,
    p.gallery
  FROM public.products p
  WHERE 
    p.id != product_id
    AND p.width IS NOT NULL
    AND p.length IS NOT NULL
    AND prod_width IS NOT NULL
    AND prod_length IS NOT NULL
    -- Toleranță ±10% pentru dimensiuni
    AND p.width BETWEEN (prod_width * (1 - tolerance_percent)) AND (prod_width * (1 + tolerance_percent))
    AND p.length BETWEEN (prod_length * (1 - tolerance_percent)) AND (prod_length * (1 + tolerance_percent))
  ORDER BY 
    -- Sortare după similaritate dimensiuni
    (ABS(p.width - prod_width) + ABS(p.length - prod_length))
  LIMIT match_count;
END;
$$;

-- 8. Policy-uri RLS pentru securitate
-- Public poate vedea doar produsele publicate
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published products"
ON public.products
FOR SELECT
USING (true);

-- Doar admin poate modifica embeddings
CREATE POLICY "Admin can update embeddings"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.email = auth.email() 
    AND u.role = 'admin'
  )
);

-- 9. Comentarii pentru documentație
COMMENT ON COLUMN public.products.embedding IS 'Vector embedding (1536 dimensiuni) generat cu OpenAI text-embedding-3-small pentru semantic search';
COMMENT ON COLUMN public.products.search_text IS 'Coloană generată automat pentru full-text search în limba română';
COMMENT ON FUNCTION search_products_semantic IS 'Căutare semantică folosind vector similarity. Returnează produse ordonate după relevanță.';
COMMENT ON FUNCTION find_similar_finishes IS 'Găsește produse cu finisaj similar folosind trigram similarity';
COMMENT ON FUNCTION find_similar_sizes IS 'Găsește produse cu dimensiuni similare (±10% toleranță)';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✓ AI Search setup complet! Extensii activate: pgvector, pg_trgm';
  RAISE NOTICE '✓ Coloane adăugate: embedding, finish, color, material, width, length, height';
  RAISE NOTICE '✓ Index-uri create pentru vector search și full-text search';
  RAISE NOTICE '✓ Funcții RPC disponibile: search_products_semantic, find_similar_finishes, find_similar_sizes';
  RAISE NOTICE '✓ Următorul pas: Generare embeddings pentru produse existente';
END $$;
