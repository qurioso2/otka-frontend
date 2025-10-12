import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Check if tax rate is used by any proforme or products
    const { data: proformeUsing, error: proformeError } = await supabase
      .from('proforme')
      .select('id')
      .eq('vat_rate', id)
      .limit(1);

    if (proformeError) {
      console.error('Error checking proforme usage:', proformeError);
      return NextResponse.json(
        { success: false, error: proformeError.message },
        { status: 500 }
      );
    }

    if (proformeUsing && proformeUsing.length > 0) {
      // Instead of deleting, mark as inactive
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
        message: 'Tax rate deactivated (was used by existing proforme)',
        data
      });
    }

    // Delete tax rate if not used
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
