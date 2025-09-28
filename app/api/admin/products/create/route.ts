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
    const {
      sku,
      name,
      slug,
      price_public_ttc,
      price_original,
      price_partner_net,
      stock_qty,
      description,
      gallery
    } = body;

    // Validation
    if (!sku || !name || !price_public_ttc) {
      return NextResponse.json({ 
        error: 'Missing required fields: sku, name, price_public_ttc' 
      }, { status: 400 });
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        sku,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price_public_ttc: parseFloat(price_public_ttc),
        price_original: price_original ? parseFloat(price_original) : null,
        price_partner_net: parseFloat(price_partner_net) || 0,
        stock_qty: parseInt(stock_qty) || 0,
        description,
        gallery: Array.isArray(gallery) ? gallery : (gallery ? [gallery] : [])
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json({ product, message: 'Product created successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}