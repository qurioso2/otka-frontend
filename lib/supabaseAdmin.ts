import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Lazy initialization - avoid build-time env var access
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

const createSupabaseAdmin = () => {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  // Only access env vars at runtime when actually needed
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
};

// Export function that returns the admin client
export const supabaseAdmin = {
  from: (table: string) => createSupabaseAdmin().from(table),
  auth: createSupabaseAdmin().auth,
  storage: createSupabaseAdmin().storage,
  rpc: (fn: string, args?: any) => createSupabaseAdmin().rpc(fn, args),
};
