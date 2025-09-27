import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // During build time, create a mock client
    console.warn('Missing Supabase environment variables during build');
  } else {
    throw new Error('Missing Supabase environment variables!');
  }
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      persistSession: true,
    },
  }
);
