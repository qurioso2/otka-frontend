import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('id', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ articles: data || [] });
  } catch (error: any) {
    console.error('Articles list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
