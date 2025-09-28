import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
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

    const body = await request.json();
    const {
      id,
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

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        sku,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price_public_ttc: parseFloat(price_public_ttc),
        price_original: price_original ? parseFloat(price_original) : null,
        price_partner_net: parseFloat(price_partner_net) || 0,
        stock_qty: parseInt(stock_qty) || 0,
        description,
        gallery: Array.isArray(gallery) ? gallery : (gallery ? [gallery] : [])
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    // Also update the public products view
    const { error: publicError } = await supabase
      .from('products_public')
      .update({
        sku,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price_public_ttc: parseFloat(price_public_ttc),
        price_original: price_original ? parseFloat(price_original) : null,
        stock_qty: parseInt(stock_qty) || 0,
        gallery: Array.isArray(gallery) ? gallery : (gallery ? [gallery] : [])
      })
      .eq('id', id);

    if (publicError) {
      console.error('Public view update error:', publicError);
      // Non-critical error, don't fail the request
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}