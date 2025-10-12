import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { type, title, url, active = true, sort_order = 0, meta } = body || {};
  if (!type || !url) return NextResponse.json({ error: 'type și url necesare' }, { status: 400 });

  const { data, error } = await supabase
    .from('public_assets')
    .insert({ type, title, url, active, sort_order, meta })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ asset: data });
