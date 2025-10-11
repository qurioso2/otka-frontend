import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Image-Assisted Product Search
 * 
 * User uploads an image -> GPT-4o Vision extracts descriptors -> 
 * Generate text embedding -> Vector search
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const filtersJson = formData.get('filters') as string;
    
    let filters = {};
    if (filtersJson) {
      try {
        filters = JSON.parse(filtersJson);
      } catch (e) {
        console.warn('Failed to parse filters:', e);
      }
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    console.log('🖼️  Image search request:', {
      fileName: image.name,
      fileSize: `${(image.size / 1024).toFixed(2)} KB`,
      fileType: image.type
    });

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type || 'image/jpeg';

    // Step 1: Use GPT-4o Vision to extract product descriptors from image
    console.log('🤖 Calling GPT-4o Vision for image analysis...');
    
    const visionPrompt = `Analizează această imagine și identifică produsul/produsele de mobilier prezente.

Extrage următoarele informații (doar dacă sunt vizibile/identificabile):
- Tip produs/categorie (ex: canapea, fotoliu, masă, scaun, dulap, pat, etc.)
- Stil (ex: modern, scandinav, industrial, clasic, minimalist, rustic, etc.)
- Material principal (ex: lemn, metal, sticlă, textil, piele, etc.)
- Culoare dominantă (ex: alb, negru, maro, gri, bej, etc.)
- Finisaj (ex: mat, lucios, lemn natur, vopsit, etc.)
- Formă caracteristică (ex: dreptunghiular, rotund, L-shape, etc.)
- Dimensiuni aproximative dacă pot fi estimate (ex: mare, mic, 2 locuri, 3 locuri)
- Caracteristici distinctive (ex: picioare înalte, design minimalist, tapițerie textilă, etc.)

IMPORTANT:
1. Fii specific dar concis
2. Nu inventa detalii care nu sunt vizibile
3. Folosește terminologie specifică mobilierului
4. Dacă în imagine sunt multiple produse, descrie cel mai proeminent
5. Returnează un JSON cu câmpurile: category, style, material, color, finish, shape, size_estimate, features

Exemplu răspuns:
{
  "category": "canapea",
  "style": "scandinav modern",
  "material": "textil și lemn",
  "color": "gri deschis",
  "finish": "mat",
  "shape": "dreptunghiular, 3 locuri",
  "size_estimate": "200-220cm lățime",
  "features": ["picioare lemn înălțate", "tapițerie textilă", "design minimalist", "spătar jos"]
}`;

    const visionCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: visionPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const visionResponse = visionCompletion.choices[0].message.content || '{}';
    console.log('📸 Vision analysis response:', visionResponse.substring(0, 200));

    // Parse the descriptors
    let descriptors: any = {};
    try {
      const jsonMatch = visionResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        descriptors = JSON.parse(jsonMatch[0]);
      } else {
        descriptors = JSON.parse(visionResponse);
      }
    } catch (parseError) {
      console.warn('Failed to parse vision response as JSON, using raw text');
      descriptors = {
        raw_description: visionResponse,
        category: 'general',
        style: 'unknown',
        material: 'unknown',
        color: 'unknown'
      };
    }

    // Step 2: Build a comprehensive search query from descriptors
    const searchQuery = [
      descriptors.category || '',
      descriptors.style || '',
      descriptors.material || '',
      descriptors.color || '',
      descriptors.finish || '',
      descriptors.shape || '',
      descriptors.features?.join(' ') || ''
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    console.log('🔍 Generated search query from image:', searchQuery);

    if (!searchQuery) {
      return NextResponse.json({
        error: 'Could not extract meaningful information from image',
        details: 'The image does not appear to contain identifiable furniture products'
      }, { status: 400 });
    }

    // Step 3: Generate text embedding from the search query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: searchQuery,
      dimensions: 1536,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 4: Vector similarity search in Supabase
    const supabase = await getServerSupabase();
    
    const { data: products, error } = await supabase.rpc(
      'search_products_semantic',
      {
        query_embedding: queryEmbedding,
        match_threshold: (filters as any)?.threshold || 0.65, // Lower threshold for image search
        match_count: (filters as any)?.limit || 20,
        price_min: (filters as any)?.priceRange?.[0] || 0,
        price_max: (filters as any)?.priceRange?.[1] || 999999,
        category_filter: (filters as any)?.category || descriptors.category || null,
        in_stock_only: (filters as any)?.inStock !== undefined ? (filters as any).inStock : false,
      }
    );

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Step 5: Enrich and rank results
    const enrichedProducts = await Promise.all(
      (products || []).map(async (product: any) => {
        // Find similar finishes
        const { data: similarFinishes } = await supabase.rpc(
          'find_similar_finishes',
          {
            product_id: product.id,
            match_count: 3,
          }
        );

        // Find similar sizes
        const { data: similarSizes } = await supabase.rpc(
          'find_similar_sizes',
          {
            product_id: product.id,
            tolerance_percent: 0.15,
            match_count: 3,
          }
        );

        // Boost score if product attributes match image descriptors
        let matchBoost = 0;
        if (descriptors.color && product.color?.toLowerCase().includes(descriptors.color.toLowerCase())) {
          matchBoost += 0.1;
        }
        if (descriptors.material && product.material?.toLowerCase().includes(descriptors.material.toLowerCase())) {
          matchBoost += 0.1;
        }
        if (descriptors.finish && product.finish?.toLowerCase().includes(descriptors.finish.toLowerCase())) {
          matchBoost += 0.05;
        }

        return {
          ...product,
          similar_finishes: similarFinishes || [],
          similar_sizes: similarSizes || [],
          similarity_score: product.similarity,
          match_boost: matchBoost,
          final_score: product.similarity + matchBoost,
        };
      })
    );

    // Final ranking
    const rankedResults = enrichedProducts
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, (filters as any)?.limit || 12);

    console.log(`✅ Found ${rankedResults.length} matching products from image`);

    return NextResponse.json({
      success: true,
      results: rankedResults,
      count: rankedResults.length,
      image_analysis: {
        descriptors,
        generated_query: searchQuery,
      },
      metadata: {
        model: 'gpt-4o',
        embedding_model: 'text-embedding-3-small',
        tokens_used: visionCompletion.usage?.total_tokens || 0,
      }
    });

  } catch (error: any) {
    console.error('❌ AI Image Search error:', error);
    return NextResponse.json({
      error: 'Image search failed',
      message: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

// GET endpoint to check capabilities
export async function GET() {
  return NextResponse.json({
    available: !!process.env.OPENAI_API_KEY,
    models: {
      vision: 'gpt-4o',
      embedding: 'text-embedding-3-small',
    },
    supported_formats: ['image/jpeg', 'image/png', 'image/webp'],
    max_file_size: '5MB',
    features: [
      'Product category detection',
      'Style identification',
      'Material recognition',
      'Color extraction',
      'Finish detection',
      'Shape analysis',
      'Semantic similarity search'
    ]
  });
}
