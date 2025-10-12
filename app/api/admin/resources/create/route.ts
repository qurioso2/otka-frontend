import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { name, description, file_type, file_url, file_size, mime_type, visible = true, partner_access = true } = body || {};
  if (!name || !file_type || !file_url) return NextResponse.json({ error: 'name, file_type și file_url sunt obligatorii' }, { status: 400 });

  const { data, error } = await supabase
    .from('partner_resources')
    .insert({ name, description, file_type, file_url, file_size, mime_type, visible, partner_access })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ resource: data });
