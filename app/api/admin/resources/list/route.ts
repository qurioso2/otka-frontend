import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
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
