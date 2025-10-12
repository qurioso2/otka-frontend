import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { id, ...patch } = body || {};
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('public_assets')
      .update(patch)
      .eq('id', id);
      
    if (error) {
      console.error('Public asset update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
