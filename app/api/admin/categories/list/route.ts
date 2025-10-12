import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('=== Categories API Debug ===');
    console.log('Using supabaseClient (same as homepage)');

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
