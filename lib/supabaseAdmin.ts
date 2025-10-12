import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Direct approach - use the exact environment variable names that work
export function getSupabaseAdmin() {
  // From debug API, these are the vars that ARE available:
  const supabaseUrl = process.env.SUPABASE_URL; // This works
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // This works
  
  console.log('=== Supabase Admin Debug ===');
  console.log('Available env vars:', {
    SUPABASE_URL: !!supabaseUrl,
    SUPABASE_ANON_KEY: !!supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }
  
  if (!supabaseAnonKey) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable');
  }

  // Use ANON key for now - we'll need to configure RLS policies properly
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
