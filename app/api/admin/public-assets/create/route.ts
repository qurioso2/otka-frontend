import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    const body = await request.json();
    const { type, title, url, active = true, sort_order = 0, meta } = body || {};
    
    if (!type || !url) {
      return NextResponse.json({ error: 'type și url necesare' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('public_assets')
      .insert({ type, title, url, active, sort_order, meta })
      .select('*')
      .single();
      
    if (error) {
      console.error('Public asset creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ asset: data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
