import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Products API Debug ===');
    console.log('Using supabaseClient (same as homepage)');

    // Try with products_public first (same as homepage)
    const { data: products, error } = await supabase
      .from('products_public')
      .select('*')
      .order('id', { ascending: false });

    console.log('Query result:', { 
      productsCount: products?.length || 0, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    console.error('=== API Exception ===');
    console.error('Error:', error?.message);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message
    }, { status: 500 });
  }
}
