import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Using supabase from import
    const body = await request.json();

    const { old_rate_id, new_rate_id } = body;

    if (!old_rate_id || !new_rate_id) {
      return NextResponse.json(
        { success: false, error: 'old_rate_id and new_rate_id are required' },
        { status: 400 }
      );
    }

    // Call the SQL function to update all products
    const { data, error } = await supabase
      .rpc('update_all_products_tax_rate', {
        old_rate_id,
        new_rate_id,
      });

    if (error) {
      console.error('Error bulk updating tax rates:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affected_count: data,
      message: `Updated ${data} products`,
    });
  } catch (error: any) {
    console.error('Error in tax-rates/bulk-update:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
