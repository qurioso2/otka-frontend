import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    const body = await request.json();
    const { id, ...patch } = body || {};
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('partner_resources')
      .update(patch)
      .eq('id', id);
      
    if (error) {
      console.error('Resource update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
