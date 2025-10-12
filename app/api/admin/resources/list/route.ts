import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    
    const { data, error } = await supabase
      .from('partner_resources')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching resources:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resources: data || [] });
  } catch (error: any) {
    console.error('Resources list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
