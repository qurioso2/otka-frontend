// app/auth/server.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '../../types/supabase';

export async function getServerSupabase() {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  return supabase;
}