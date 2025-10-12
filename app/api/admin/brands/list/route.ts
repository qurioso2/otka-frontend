import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    console.log('=== Brands API Debug ===');
    console.log('Using getServerSupabase (server-side)');

    // Get all brands
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('sort_order', { ascending: true });

    console.log('Brands result:', { 
      brandsCount: data?.length || 0, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error) {
      console.error('Error fetching brands:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Brands list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
