import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    const body = await request.json();
    const { id, ...patch } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('articles').update(patch).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Articles update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
