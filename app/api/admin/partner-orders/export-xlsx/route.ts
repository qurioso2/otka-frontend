import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    
    const { data, error } = await supabase
      .from('partner_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
      
    if (error) {
      console.error('Partner orders export error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Excel export response
    return NextResponse.json({ message: 'Excel export functionality', data: data || [] });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
