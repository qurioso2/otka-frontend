import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Lazy initialization to avoid build-time issues
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseAdmin() {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseAdmin;
}

// Admin client with service_role key - bypasses RLS
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
