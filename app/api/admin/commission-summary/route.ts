import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
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
