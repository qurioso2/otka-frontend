import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
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
