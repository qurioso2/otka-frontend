import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if this tax rate is used in products
    const { data: productsWithTaxRate, error: checkError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('tax_rate_id', id);

    if (checkError) {
      console.error('Error checking products:', checkError);
      return NextResponse.json(
        { success: false, error: checkError.message },
        { status: 500 }
      );
    }

    // If tax rate is used in products, deactivate instead of delete
    if (productsWithTaxRate && (productsWithTaxRate as any).count > 0) {
      const { data, error } = await supabase
        .from('tax_rates')
        .update({ active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deactivating tax rate:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
        message: 'Tax rate deactivated (in use by products)',
      });
    }

    // Otherwise, delete
    const { error } = await supabase
      .from('tax_rates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tax rate:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tax rate deleted',
    });
  } catch (error: any) {
    console.error('Error in tax-rates/delete:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
