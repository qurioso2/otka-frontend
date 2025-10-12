import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();

    const { data, error } = await supabase
      .from('public_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public assets:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assets: data || [] });
  } catch (error: any) {
    console.error('Public assets list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
