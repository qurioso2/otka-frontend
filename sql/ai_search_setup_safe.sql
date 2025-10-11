-- AI Search Setup pentru OTKA - VERSIUNE SAFE
-- Verifică schema existentă și adaugă doar ce lipsește

-- 1. Activare extensii
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Adăugare coloane doar dacă nu există
DO $$ 
BEGIN
    -- Embedding vector
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'embedding'
    ) THEN
        ALTER TABLE public.products ADD COLUMN embedding vector(1536);
        RAISE NOTICE '✓ Coloană embedding adăugată';
    ELSE
        RAISE NOTICE '○ Coloana embedding există deja';
    END IF;

    -- Finish
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'finish'
    ) THEN
        ALTER TABLE public.products ADD COLUMN finish VARCHAR(100);
        RAISE NOTICE '✓ Coloană finish adăugată';
    ELSE
        RAISE NOTICE '○ Coloana finish există deja';
    END IF;

    -- Color
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE public.products ADD COLUMN color VARCHAR(50);
        RAISE NOTICE '✓ Coloană color adăugată';
    ELSE
        RAISE NOTICE '○ Coloana color există deja';
    END IF;

    -- Material
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'material'
    ) THEN
        ALTER TABLE public.products ADD COLUMN material VARCHAR(100);
        RAISE NOTICE '✓ Coloană material adăugată';
    ELSE
        RAISE NOTICE '○ Coloana material există deja';
    END IF;

    -- Width
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'width'
    ) THEN
        ALTER TABLE public.products ADD COLUMN width DECIMAL(8,2);
        RAISE NOTICE '✓ Coloană width adăugată';
    ELSE
        RAISE NOTICE '○ Coloana width există deja';
    END IF;

    -- Length
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'length'
    ) THEN
        ALTER TABLE public.products ADD COLUMN length DECIMAL(8,2);
        RAISE NOTICE '✓ Coloană length adăugată';
    ELSE
        RAISE NOTICE '○ Coloana length există deja';
    END IF;

    -- Height
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'height'
    ) THEN
        ALTER TABLE public.products ADD COLUMN height DECIMAL(8,2);
        RAISE NOTICE '✓ Coloană height adăugată';
    ELSE
        RAISE NOTICE '○ Coloana height există deja';
    END IF;

    -- Weight
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'weight'
    ) THEN
        ALTER TABLE public.products ADD COLUMN weight DECIMAL(8,2);
        RAISE NOTICE '✓ Coloană weight adăugată';
    ELSE
        RAISE NOTICE '○ Coloana weight există deja';
    END IF;

    -- Price list source
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'price_list_source'
    ) THEN
        ALTER TABLE public.products ADD COLUMN price_list_source VARCHAR(200);
        RAISE NOTICE '✓ Coloană price_list_source adăugată';
    ELSE
        RAISE NOTICE '○ Coloana price_list_source există deja';
    END IF;

    -- Price list uploaded at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'price_list_uploaded_at'
    ) THEN
        ALTER TABLE public.products ADD COLUMN price_list_uploaded_at TIMESTAMPTZ;
        RAISE NOTICE '✓ Coloană price_list_uploaded_at adăugată';
    ELSE
        RAISE NOTICE '○ Coloana price_list_uploaded_at există deja';
    END IF;

    -- Description (verifică dacă există, altfel adaugă)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.products ADD COLUMN description TEXT;
        RAISE NOTICE '✓ Coloană description adăugată';
    ELSE
        RAISE NOTICE '○ Coloana description există deja';
    END IF;

    -- Category
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.products ADD COLUMN category VARCHAR(100);
        RAISE NOTICE '✓ Coloană category adăugată';
    ELSE
        RAISE NOTICE '○ Coloana category există deja';
    END IF;

END $$;

-- 3. Creare coloană search_text generată (cu verificare coloane existente)
DO $$
DECLARE
    has_name BOOLEAN;
    has_description BOOLEAN;
    has_category BOOLEAN;
    has_finish BOOLEAN;
    has_material BOOLEAN;
    search_expr TEXT;
BEGIN
    -- Verifică ce coloane există
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'name'
    ) INTO has_name;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'description'
    ) INTO has_description;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category'
    ) INTO has_category;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'finish'
    ) INTO has_finish;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'material'
    ) INTO has_material;

    -- Construiește expresia pentru search_text
    search_expr := 'to_tsvector(''romanian'', ';
    
    IF has_name THEN
        search_expr := search_expr || 'coalesce(name, '''')';
    ELSE
        search_expr := search_expr || '''''';
    END IF;

    IF has_description THEN
        search_expr := search_expr || ' || '' '' || coalesce(description, '''')';
    END IF;

    IF has_category THEN
        search_expr := search_expr || ' || '' '' || coalesce(category, '''')';
    END IF;

    IF has_finish THEN
        search_expr := search_expr || ' || '' '' || coalesce(finish, '''')';
    END IF;

    IF has_material THEN
        search_expr := search_expr || ' || '' '' || coalesce(material, '''')';
    END IF;

    search_expr := search_expr || ')';

    -- Șterge coloana dacă există și recrează cu expresia corectă
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'search_text'
    ) THEN
        EXECUTE 'ALTER TABLE public.products DROP COLUMN search_text';
        RAISE NOTICE '○ Coloana search_text existentă ștearsă pentru recreare';
    END IF;

    EXECUTE 'ALTER TABLE public.products ADD COLUMN search_text tsvector GENERATED ALWAYS AS (' || search_expr || ') STORED';
    RAISE NOTICE '✓ Coloană search_text generată adăugată';
END $$;

-- 4. Creare index-uri (cu verificare existență)
DO $$ 
BEGIN
    -- Index pentru vector similarity search
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND indexname = 'products_embedding_idx'
    ) THEN
        CREATE INDEX products_embedding_idx ON public.products 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
        RAISE NOTICE '✓ Index products_embedding_idx creat';
    ELSE
        RAISE NOTICE '○ Index products_embedding_idx există deja';
    END IF;

    -- Index pentru full-text search
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND indexname = 'products_search_text_idx'
    ) THEN
        CREATE INDEX products_search_text_idx ON public.products USING GIN(search_text);
        RAISE NOTICE '✓ Index products_search_text_idx creat';
    ELSE
        RAISE NOTICE '○ Index products_search_text_idx există deja';
    END IF;

    -- Index pentru finish
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND indexname = 'products_finish_idx'
    ) THEN
        CREATE INDEX products_finish_idx ON public.products(finish);
        RAISE NOTICE '✓ Index products_finish_idx creat';
    ELSE
        RAISE NOTICE '○ Index products_finish_idx există deja';
    END IF;

    -- Index pentru material
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND indexname = 'products_material_idx'
    ) THEN
        CREATE INDEX products_material_idx ON public.products(material);
        RAISE NOTICE '✓ Index products_material_idx creat';
    ELSE
        RAISE NOTICE '○ Index products_material_idx există deja';
    END IF;

    -- Index pentru dimensiuni
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'products' 
        AND indexname = 'products_dimensions_idx'
    ) THEN
        CREATE INDEX products_dimensions_idx ON public.products(width, length, height);
        RAISE NOTICE '✓ Index products_dimensions_idx creat';
    ELSE
        RAISE NOTICE '○ Index products_dimensions_idx există deja';
    END IF;
END $$;

-- 5. Funcție RPC pentru semantic search
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
    p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND p.price_public_ttc BETWEEN price_min AND price_max
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (NOT in_stock_only OR p.stock_qty > 0)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Funcție pentru full-text search
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

-- 7. Funcție pentru găsire produse similare după finisaj
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
  SELECT p.finish INTO product_finish
  FROM public.products p
  WHERE p.id = product_id;
  
  IF product_finish IS NULL THEN
    RETURN;
  END IF;
  
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
    AND similarity(p.finish, product_finish) > 0.3
  ORDER BY similarity(p.finish, product_finish) DESC
  LIMIT match_count;
END;
$$;

-- 8. Funcție pentru găsire produse similare după dimensiuni
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
  SELECT p.width, p.length, p.height 
  INTO prod_width, prod_length, prod_height
  FROM public.products p
  WHERE p.id = product_id;
  
  IF prod_width IS NULL OR prod_length IS NULL THEN
    RETURN;
  END IF;
  
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
    AND p.width BETWEEN (prod_width * (1 - tolerance_percent)) AND (prod_width * (1 + tolerance_percent))
    AND p.length BETWEEN (prod_length * (1 - tolerance_percent)) AND (prod_length * (1 + tolerance_percent))
  ORDER BY 
    (ABS(p.width - prod_width) + ABS(p.length - prod_length))
  LIMIT match_count;
END;
$$;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ AI Search setup complet!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Extensii activate: pgvector, pg_trgm';
  RAISE NOTICE '✓ Coloane verificate/adăugate';
  RAISE NOTICE '✓ Index-uri create pentru search';
  RAISE NOTICE '✓ Funcții RPC disponibile:';
  RAISE NOTICE '  - search_products_semantic()';
  RAISE NOTICE '  - search_products_fulltext()';
  RAISE NOTICE '  - find_similar_finishes()';
  RAISE NOTICE '  - find_similar_sizes()';
  RAISE NOTICE '';
  RAISE NOTICE '📌 Următorul pas:';
  RAISE NOTICE '   1. Adaugă OPENAI_API_KEY în .env.local';
  RAISE NOTICE '   2. Rulează: tsx scripts/generate-embeddings.ts';
  RAISE NOTICE '';
END $$;
