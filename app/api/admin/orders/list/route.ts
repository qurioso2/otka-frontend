import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
    const supabase = await getServerSupabase();
  try {
    console.log('=== Orders API (using getServerSupabase) ===');
    
    const supabase = await getServerSupabase();
    
    const { data, error } = await supabase
      .from('manual_orders')
      .select(`
        *,
        clients(name, email, company)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (error: any) {
    console.error('Orders list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
