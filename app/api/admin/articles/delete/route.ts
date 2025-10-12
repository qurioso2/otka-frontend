import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Articles delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
