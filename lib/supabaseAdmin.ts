import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Use the environment variables that ARE available at runtime
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment variables available:', {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
  });

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  // TEMPORARY: Use ANON key until SERVICE_ROLE key is available
  const fallbackKey = process.env.SUPABASE_ANON_KEY;
  const keyToUse = supabaseServiceRoleKey || fallbackKey;
  
  if (!keyToUse) {
    throw new Error('Missing both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY');
  }

  console.log('Creating Supabase client with:', {
    url: supabaseUrl,
    keyType: supabaseServiceRoleKey ? 'SERVICE_ROLE' : 'ANON (fallback)',
    keyLength: keyToUse.length
  });

  return createClient<Database>(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// For backward compatibility - create getter-based object
export const supabaseAdmin = {
  get from() {
    return getSupabaseAdmin().from.bind(getSupabaseAdmin());
  },
  get auth() {
    return getSupabaseAdmin().auth;
  },
  get storage() {
    return getSupabaseAdmin().storage;
  },
  get rpc() {
    return getSupabaseAdmin().rpc.bind(getSupabaseAdmin());
  }
};
