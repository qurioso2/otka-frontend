import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    console.log('=== Categories API Debug ===');
    console.log('Using getServerSupabase (server-side)');

    // Get all categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    console.log('Categories result:', { 
      categoriesCount: data?.length || 0, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Categories list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
