import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Lazy initialization - completely avoid any build-time execution
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  // Only access env vars when this function is explicitly called
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabaseAdmin;
}

// For backward compatibility, keep the old export name but as a function call
export const supabaseAdmin = {
  from: (table: string) => getSupabaseAdmin().from(table),
  auth: getSupabaseAdmin().auth,
  storage: getSupabaseAdmin().storage,
  rpc: (fn: string, args?: any) => getSupabaseAdmin().rpc(fn, args),
};
