import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clients: data || [] });
  } catch (error: any) {
    console.error('Clients list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
