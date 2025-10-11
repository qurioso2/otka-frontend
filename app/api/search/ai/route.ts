import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Step 1: Generate embedding pentru query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1536,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 2: Vector similarity search în Supabase
    const supabase = await getServerSupabase();
    
    const { data: products, error } = await supabase.rpc(
      'search_products_semantic',
      {
        query_embedding: queryEmbedding,
        match_threshold: filters?.threshold || 0.7,
        match_count: filters?.limit || 20,
        price_min: filters?.priceRange?.[0] || 0,
        price_max: filters?.priceRange?.[1] || 999999,
        category_filter: filters?.category || null,
        in_stock_only: filters?.inStock !== undefined ? filters.inStock : true,
      }
    );

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Step 3: Găsire produse similare pentru fiecare rezultat
    const enrichedProducts = await Promise.all(
      (products || []).map(async (product: any) => {
        // Găsire finisaje similare
        const { data: similarFinishes } = await supabase.rpc(
          'find_similar_finishes',
          {
            product_id: product.id,
            match_count: 3,
          }
        );

        // Găsire dimensiuni similare
        const { data: similarSizes } = await supabase.rpc(
          'find_similar_sizes',
          {
            product_id: product.id,
            tolerance_percent: 0.1,
            match_count: 3,
          }
        );

        return {
          ...product,
          similar_finishes: similarFinishes || [],
          similar_sizes: similarSizes || [],
          similarity_score: product.similarity,
        };
      })
    );

    // Step 4: Ranking și filtrare finală
    const rankedResults = enrichedProducts
      .map((p) => ({
        ...p,
        // Scoring composite
        final_score:
          p.similarity_score * 0.6 +
          (p.stock_qty > 0 ? 0.2 : 0) +
          (p.similar_finishes.length > 0 ? 0.1 : 0) +
          (p.similar_sizes.length > 0 ? 0.1 : 0),
      }))
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, filters?.limit || 12);

    return NextResponse.json({
      success: true,
      results: rankedResults,
      count: rankedResults.length,
      query: query,
    });
  } catch (error: any) {
    console.error('AI Search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        message: error.message,
        details: error.toString() 
      },
      { status: 500 }
    );
  }
}
