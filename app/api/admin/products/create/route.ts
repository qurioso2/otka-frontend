import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email!)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    console.log('Received product data:', body); // Debug log
    
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

    // Validate numeric fields
    const parsedPrice = parseFloat(price_public_ttc);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ 
        error: 'Invalid price_public_ttc value',
        received: price_public_ttc 
      }, { status: 400 });
    }

    // Create product - process validated data from frontend
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
      ...(category && { category: category.trim() })
    };

    console.log('Inserting product:', productToInsert);

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
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}