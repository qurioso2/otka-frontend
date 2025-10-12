import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)

    // Parse request body
    const body = await request.json();
    console.log('Received update data:', body);
    
    const { id, ...updateData } = body;

    // Validation
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Process update data
    const productToUpdate: any = {};
    
    if (updateData.sku) productToUpdate.sku = updateData.sku.trim();
    if (updateData.name) productToUpdate.name = updateData.name.trim();
    if (updateData.slug) productToUpdate.slug = updateData.slug;
    if (updateData.price_public_ttc !== undefined) {
      productToUpdate.price_public_ttc = typeof updateData.price_public_ttc === 'number' 
        ? updateData.price_public_ttc 
        : parseFloat(updateData.price_public_ttc);
    }
    if (updateData.price_partner_net !== undefined) {
      productToUpdate.price_partner_net = typeof updateData.price_partner_net === 'number'
        ? updateData.price_partner_net
        : parseFloat(updateData.price_partner_net);
    }
    if (updateData.stock_qty !== undefined) {
      productToUpdate.stock_qty = typeof updateData.stock_qty === 'number'
        ? updateData.stock_qty
        : parseInt(updateData.stock_qty);
    }
    if (updateData.gallery) productToUpdate.gallery = Array.isArray(updateData.gallery) ? updateData.gallery : [];
    if (updateData.description !== undefined) productToUpdate.description = updateData.description;
    if (updateData.summary !== undefined) productToUpdate.summary = updateData.summary;
    if (updateData.category !== undefined) productToUpdate.category = updateData.category;
    if (updateData.brand_id !== undefined) {
      productToUpdate.brand_id = typeof updateData.brand_id === 'number'
        ? updateData.brand_id
        : parseInt(updateData.brand_id);
    }

    console.log('Updating product:', { id, ...productToUpdate });

    const { data: product, error } = await supabase
      .from('products')
      .update(productToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);
      return NextResponse.json({ 
        error: 'Failed to update product', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ product, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
