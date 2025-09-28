-- FIX FUNCTIE AUTENTIFICARE - REPARARE PROBLEME COMUNE
-- Acest script repară probleme comune cu autentificarea

-- 1) RECREAZA FUNCTIA IS_ADMIN CU DEBUGGING
DROP FUNCTION IF EXISTS public.is_admin(text);

CREATE OR REPLACE FUNCTION public.is_admin(email_input text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users u 
    WHERE u.email = $1 
    AND u.role = 'admin'
    AND u.partner_status = 'active'
  );
$$;

-- 2) RECREAZA FUNCTIA PROTECT_USERS_ADMIN_COLS CU FIX
DROP FUNCTION IF EXISTS public.protect_users_admin_cols() CASCADE;

CREATE OR REPLACE FUNCTION public.protect_users_admin_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Doar adminii pot modifica role sau partner_status
  -- Verifica atat auth.email() cat si auth.jwt() ->> 'email'
  IF NOT (
    public.is_admin(auth.email()) OR 
    public.is_admin(auth.jwt() ->> 'email')
  ) THEN
    IF (NEW.role IS DISTINCT FROM OLD.role) OR 
       (NEW.partner_status IS DISTINCT FROM OLD.partner_status) THEN
      RAISE EXCEPTION 'Nu aveti permisiunea sa modificati role sau partner_status. Email: %, Role detectat: %', 
        COALESCE(auth.email(), auth.jwt() ->> 'email', 'UNKNOWN'),
        (SELECT role FROM public.users WHERE email = COALESCE(auth.email(), auth.jwt() ->> 'email'));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreaza trigger-ul
DROP TRIGGER IF EXISTS protect_users_admin_cols ON public.users;
CREATE TRIGGER protect_users_admin_cols
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.protect_users_admin_cols();

-- 3) ACTUALIZEAZA POLICIES PENTRU USERS (FIX DUAL AUTH)
DROP POLICY IF EXISTS "users_select_self" ON public.users;
DROP POLICY IF EXISTS "users_select_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;
DROP POLICY IF EXISTS "users_update_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_admin" ON public.users;

-- Policy pentru citire propriu profil (cu dual auth check)
CREATE POLICY "users_select_self" ON public.users
  FOR SELECT TO authenticated
  USING (
    email = auth.email() OR 
    email = auth.jwt() ->> 'email'
  );

-- Policy pentru admin sa vada tot (cu dual auth check)
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.email()) OR 
    public.is_admin(auth.jwt() ->> 'email')
  );

-- Policy pentru update profil propriu
CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE TO authenticated
  USING (
    email = auth.email() OR 
    email = auth.jwt() ->> 'email'
  )
  WITH CHECK (
    email = auth.email() OR 
    email = auth.jwt() ->> 'email'
  );

-- Policy pentru admin sa poata update orice
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.email()) OR 
    public.is_admin(auth.jwt() ->> 'email')
  )
  WITH CHECK (true);

-- Policy pentru admin sa poata insera utilizatori
CREATE POLICY "users_insert_admin" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin(auth.email()) OR 
    public.is_admin(auth.jwt() ->> 'email')
  );

-- 4) ACTUALIZEAZA POLICIES PENTRU PRODUCTS (FIX DUAL AUTH)
DROP POLICY IF EXISTS "auth_write_products" ON public.products;
DROP POLICY IF EXISTS "auth_update_products" ON public.products;

-- Policy pentru admin sa poata scrie produse
CREATE POLICY "auth_write_products" ON public.products 
  FOR INSERT TO authenticated 
  WITH CHECK (
    public.is_admin(auth.email()) OR 
    public.is_admin(auth.jwt() ->> 'email')
  );

CREATE POLICY "auth_update_products" ON public.products 
  FOR UPDATE TO authenticated 
  USING (
    public.is_admin(auth.email()) OR 
    public.is_admin(auth.jwt() ->> 'email')
  ) 
  WITH CHECK (
    public.is_admin(auth.email()) OR 
    public.is_admin(auth.jwt() ->> 'email')
  );

-- 5) TEST FINAL
SELECT 
  'FIX APLICAT SUCCESSFULLY!' as status,
  'Acum testează din aplicație cu admin@otka.ro' as next_step;