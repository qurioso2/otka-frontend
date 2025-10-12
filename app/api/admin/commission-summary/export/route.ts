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
      console.error('Commission export error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Basic CSV export functionality
    const csvContent = 'data:text/csv;charset=utf-8,Commission Export Data\n';
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="commission-export.csv"'
      }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
