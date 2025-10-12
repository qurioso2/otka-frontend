import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('partner_orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Partner order detail error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
