import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    const body = await request.json();
    const { name, description, file_type, file_url, file_size, mime_type, visible = true, partner_access = true } = body || {};
    
    if (!name || !file_type || !file_url) {
      return NextResponse.json({ error: 'name, file_type și file_url sunt obligatorii' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('partner_resources')
      .insert({ name, description, file_type, file_url, file_size, mime_type, visible, partner_access })
      .select()
      .single();
      
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resource: data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
