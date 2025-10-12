import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if status is being changed from paid to pending (restore stock)
    if (updateData.status === 'pending') {
      // Get current proforma status
      const { data: currentProforma, error: currentError } = await supabase
        .from('proforme')
        .select('status')
        .eq('id', id)
        .single();

      if (!currentError && currentProforma && currentProforma.status === 'paid') {
        // Restore stock - get proforma items
        const { data: items, error: itemsError } = await supabase
          .from('proforma_items')
          .select('product_id, quantity')
          .eq('proforma_id', id);

        if (!itemsError && items && items.length > 0) {
          for (const item of items) {
            if (item.product_id) {
              // Get current stock
              const { data: product, error: productError } = await supabase
                .from('products')
                .select('stock_qty')
                .eq('id', item.product_id)
                .single();

              if (!productError && product) {
                const newStock = (product.stock_qty || 0) + item.quantity;
                
                // Update stock
                await supabase
                  .from('products')
                  .update({ stock_qty: newStock })
                  .eq('id', item.product_id);
              }
            }
          }
        }
      }
    }

    // Update proforma
    const { data, error } = await supabase
      .from('proforme')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating proforma:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in proforme/update:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
