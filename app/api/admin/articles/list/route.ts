import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
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
