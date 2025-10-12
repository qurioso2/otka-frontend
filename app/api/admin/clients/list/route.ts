import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    
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
