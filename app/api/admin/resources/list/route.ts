import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ resources: data || [] });
}