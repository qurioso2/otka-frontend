import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Support both client-side (NEXT_PUBLIC_) and server-side variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables! Need SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_ versions)');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});
