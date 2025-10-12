import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // During build time, environment variables might not be available
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    console.warn('Supabase environment variables not available during build');
  } else {
    throw new Error('Missing Supabase environment variables');
  }
}

// Admin client with service_role key - bypasses RLS
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
