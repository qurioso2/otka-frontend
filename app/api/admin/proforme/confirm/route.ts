import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    // Using supabase from import
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Get proforma items to decrease stock
    const { data: items, error: itemsError } = await supabase
      .from('proforma_items')
      .select('product_id, quantity')
      .eq('proforma_id', id);

    if (itemsError) {
      console.error('Error fetching proforma items:', itemsError);
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }

    // Decrease stock for each product
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.product_id) {
          // Get current stock
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock_qty')
            .eq('id', item.product_id)
            .single();

          if (!productError && product) {
            const newStock = Math.max(0, (product.stock_qty || 0) - item.quantity);
            
            // Update stock
            await supabase
              .from('products')
              .update({ stock_qty: newStock })
              .eq('id', item.product_id);
          }
        }
      }
    }

    // Update status to paid and set confirmed_at
    const { data, error } = await supabase
      .from('proforme')
      .update({
        status: 'paid',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error confirming proforma:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Proforma confirmed and marked as paid. Stock updated.',
    });
  } catch (error: any) {
    console.error('Error in proforme/confirm:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
