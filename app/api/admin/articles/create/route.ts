import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { slug, title, body: articleBody, images = [], published = false } = body || {};
  if (!slug || !title) return NextResponse.json({ error: 'slug și title necesare' }, { status: 400 });

  const { data, error } = await supabase
    .from('articles')
    .insert({ slug, title, body: articleBody, images, published })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ article: data });
}
