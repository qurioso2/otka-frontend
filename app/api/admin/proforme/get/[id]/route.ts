import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Using supabase from import
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Get proforma
    const { data: proforma, error } = await supabase
      .from('proforme')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching proforma:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    // Get proforma items with tax rate details
    const { data: items, error: itemsError } = await supabase
      .from('proforma_items')
      .select(`
        *,
        tax_rates (id, name, rate)
      `)
      .eq('proforma_id', id)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching proforma items:', itemsError);
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...proforma,
        items: items || [],
      },
    });
  } catch (error: any) {
    console.error('Error in proforme/get:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
