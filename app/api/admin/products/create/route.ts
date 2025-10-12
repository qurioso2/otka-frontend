import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    console.log('=== Products Create (using getServerSupabase) ===');

    const supabase = await getServerSupabase();

    // Parse request body
    const body = await request.json();
    console.log('Create request body:', body);
    
    const {
      sku,
      name,
      slug,
      price_public_ttc,
      price_original,
      price_partner_net,
      stock_qty,
      gallery,
      description,
      summary,
      category,
      brand_id
    } = body;

    // Validation
    if (!sku || !name || price_public_ttc === undefined || price_public_ttc === '') {
      return NextResponse.json({ 
        error: 'Missing required fields: sku, name, price_public_ttc',
        received: { sku: !!sku, name: !!name, price_public_ttc: price_public_ttc }
      }, { status: 400 });
    }

    // Create product
    const productToInsert = {
      sku: sku?.trim(),
      name: name?.trim(),
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price_public_ttc: typeof price_public_ttc === 'number' ? price_public_ttc : parseFloat(price_public_ttc),
      price_partner_net: typeof price_partner_net === 'number' ? price_partner_net : (parseFloat(price_partner_net) || 0),
      stock_qty: typeof stock_qty === 'number' ? stock_qty : (parseInt(stock_qty) || 0),
      gallery: Array.isArray(gallery) ? gallery : [],
      ...(price_original && { price_original: typeof price_original === 'number' ? price_original : parseFloat(price_original) }),
      ...(description && { description: description.trim() }),
      ...(summary && { summary: summary.trim() }),
      ...(category && { category: category.trim() }),
      ...(brand_id && { brand_id: typeof brand_id === 'number' ? brand_id : parseInt(brand_id) })
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      return NextResponse.json({ 
        error: 'Failed to create product', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ product, message: 'Product created successfully' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
