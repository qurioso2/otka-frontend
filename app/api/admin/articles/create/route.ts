import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { slug, title, body: articleBody, images = [], published = false } = body || {};
    if (!slug || !title) return NextResponse.json({ error: 'slug și title necesare' }, { status: 400 });

    const { data, error } = await supabase
      .from('articles')
      .insert({ slug, title, body: articleBody, images, published })
      .select('*')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ article: data });
  } catch (error: any) {
    console.error('Articles create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
