import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

// Fallback la full-text search dacă AI search eșuează
export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    // Full-text search folosind funcția RPC
    const { data: products, error } = await supabase.rpc(
      'search_products_fulltext',
      {
        search_query: query,
        match_count: filters?.limit || 10,
      }
    );

    if (error) {
      console.error('Fulltext search error:', error);
      throw error;
    }

    // Enrich cu detalii complete
    const productIds = products?.map((p: any) => p.id) || [];
    
    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        count: 0,
        query: query,
        fallback: true,
      });
    }

    const { data: fullProducts } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    // Apply filters
    let filteredProducts = fullProducts || [];

    if (filters?.priceRange) {
      filteredProducts = filteredProducts.filter(
        (p: any) =>
          p.price_public_ttc >= filters.priceRange[0] &&
          p.price_public_ttc <= filters.priceRange[1]
      );
    }

    if (filters?.category) {
      filteredProducts = filteredProducts.filter(
        (p: any) => p.category === filters.category
      );
    }

    if (filters?.inStock !== undefined && filters.inStock) {
      filteredProducts = filteredProducts.filter(
        (p: any) => p.stock_qty > 0
      );
    }

    return NextResponse.json({
      success: true,
      results: filteredProducts,
      count: filteredProducts.length,
      query: query,
      fallback: true,
    });
  } catch (error: any) {
    console.error('Fallback search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    );
  }
}
