import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    const { data, error } = await supabase
      .from('public_assets')
      .select('*')
      .eq('active', true)
      .eq('type', 'og')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ url: data?.url || '/logo-og.png' });
  } catch {
    return NextResponse.json({ url: '/logo-og.png' });
  }
}