import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedProduct {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price_public_ttc?: number;
  finish?: string;
  color?: string;
  material?: string;
  width?: number;
  length?: number;
  height?: number;
  weight?: number;
  gallery?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
    // Verify admin access
    }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const brandName = formData.get('brandName') as string || 'Unknown';
    const catalogType = formData.get('catalogType') as string || 'general';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'pdf') {
      return NextResponse.json(
        { error: `Format nesuportat: ${fileExt}. Folosiți doar PDF` },
        { status: 400 }
      );
    }

    console.log(`🔍 Processing PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Pdf = buffer.toString('base64');

    // Upload to Supabase Storage pentru referință
    const timestamp = Date.now();
    const storagePath = `catalogs/${timestamp}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('price-lists')
      .upload(storagePath, file);

    if (uploadError) {
      console.warn('⚠️ Storage upload warning:', uploadError.message);
    }

    // Get public URL for storage
    const { data: { publicUrl } } = supabase.storage
      .from('price-lists')
      .getPublicUrl(storagePath);

    console.log('📤 PDF uploaded to storage:', storagePath);

    // Use GPT-4o Vision to extract products from PDF
    console.log('🤖 Calling GPT-4o Vision for product extraction...');
    
    const extractionPrompt = `Analizează acest catalog PDF și extrage toate produsele cu detaliile lor.

Pentru fiecare produs identificat, extrage:
- SKU/Cod produs (obligatoriu)
- Nume produs (obligatoriu)
- Descriere (dacă există)
- Categorie (ex: mobilier living, dormitor, etc.)
- Preț (în orice valută menționată)
- Finisaj/Finish (ex: lemn nuc, lac mat, etc.)
- Culoare
- Material (ex: lemn masiv, MDF, metal, etc.)
- Dimensiuni: Lățime (Width), Lungime (Length), Înălțime (Height) în cm
- Greutate în kg (dacă este menționată)

IMPORTANT:
1. SKU-ul este crucial - caută coduri de produs, referințe, cod articol
2. Pentru dimensiuni, convertește toate la cm dacă sunt în alte unități
3. Pentru prețuri, păstrează valoarea numerică
4. Dacă un câmp lipsește, nu-l include
5. Returnează DOAR un JSON valid, fără text suplimentar

Format răspuns (array de produse):
[
  {
    "sku": "COD123",
    "name": "Nume Produs",
    "description": "Descriere detaliată",
    "category": "Categoria",
    "price_public_ttc": 1299.99,
    "finish": "Lemn nuc",
    "color": "Maro închis",
    "material": "Lemn masiv",
    "width": 120,
    "length": 45,
    "height": 75,
    "weight": 25.5
  }
]

Brand/Producător: ${brandName}
Tip catalog: ${catalogType}

Analizează catalogul și returnează JSON-ul cu toate produsele găsite.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Latest GPT-4 with vision
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: extractionPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64Pdf}`,
                detail: 'high' // High detail for better extraction
              }
            }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.1, // Low temperature for consistent extraction
    });

    const responseText = completion.choices[0].message.content || '';
    console.log('📄 GPT-4o Response length:', responseText.length);

    // Parse JSON response
    let extractedProducts: ExtractedProduct[] = [];
    
    try {
      // Try to extract JSON from response (might have markdown wrapping)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedProducts = JSON.parse(jsonMatch[0]);
      } else {
        extractedProducts = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('Raw response:', responseText.substring(0, 500));
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: 'GPT-4o response was not valid JSON',
        raw_response: responseText.substring(0, 1000)
      }, { status: 500 });
    }

    console.log(`✅ Extracted ${extractedProducts.length} products from PDF`);

    if (extractedProducts.length === 0) {
      return NextResponse.json({
        error: 'No products found in PDF',
        message: 'GPT-4o could not extract any products from the catalog',
        suggestion: 'Please check if the PDF contains product information in a readable format'
      }, { status: 400 });
    }

    // Prepare products for database insertion
    const productsToInsert = extractedProducts.map((product, index) => {
      // Generate slug from name
      const slug = product.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return {
        sku: product.sku || `${brandName.toUpperCase()}-${Date.now()}-${index}`,
        name: product.name,
        slug: `${slug}-${product.sku?.toLowerCase() || index}`,
        description: product.description || null,
        category: product.category || catalogType,
        price_public_ttc: product.price_public_ttc || 0,
        price_partner_net: product.price_public_ttc ? product.price_public_ttc * 0.85 : 0, // 15% discount default
        stock_qty: 0, // Default to 0, admin can update later
        finish: product.finish || null,
        color: product.color || null,
        material: product.material || null,
        width: product.width || null,
        length: product.length || null,
        height: product.height || null,
        weight: product.weight || null,
        gallery: product.gallery || [],
        price_list_source: `${file.name} (PDF Import)`,
        price_list_uploaded_at: new Date().toISOString(),
      };
    });

    console.log('💾 Inserting products to database...');

    // Insert products to database with upsert (update if SKU exists)
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .upsert(productsToInsert, { 
        onConflict: 'sku',
        ignoreDuplicates: false 
      })
      .select();

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
      return NextResponse.json({
        error: 'Database insertion failed',
        details: insertError.message,
        extracted_count: extractedProducts.length
      }, { status: 500 });
    }

    console.log(`✅ Successfully imported ${insertedProducts?.length || 0} products`);

    return NextResponse.json({
      success: true,
      imported: insertedProducts?.length || 0,
      total_extracted: extractedProducts.length,
      file_name: file.name,
      brand: brandName,
      catalog_type: catalogType,
      storage_path: uploadError ? null : storagePath,
      storage_url: uploadError ? null : publicUrl,
      products: insertedProducts?.slice(0, 10) || [], // Return first 10 for preview
      ai_model: 'gpt-4o',
      tokens_used: completion.usage?.total_tokens || 0
    });

  } catch (error: any) {
    console.error('❌ PDF Import error:', error);
    return NextResponse.json({
      error: 'PDF import failed',
      message: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

// GET endpoint to check if PDF import is available
export async function GET() {
  return NextResponse.json({
    available: !!process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    supported_formats: ['pdf'],
    max_file_size: '20MB',
    features: [
      'Text extraction from PDF',
      'Product identification',
      'Price extraction',
      'Dimension parsing',
      'Material and finish detection',
      'Automatic SKU generation if missing'
    ]
  });
}
