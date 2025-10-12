import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    console.log('=== Products API (using getServerSupabase) ===');

    const supabase = await getServerSupabase();

    // Fetch products from main table
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    console.log('Products result:', { 
      productsCount: products?.length || 0, 
      hasError: !!error,
      errorMessage: error?.message 
    });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch products', 
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    console.error('Products API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message
    }, { status: 500 });
  }
}
