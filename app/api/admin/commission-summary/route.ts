import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    
    const { data, error } = await supabase
      .from('commission_summary_view')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Commission summary error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
