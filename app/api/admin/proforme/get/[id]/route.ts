import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Get proforma
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .select('*')
      .eq('id', id)
      .single();

    if (proformaError) {
      console.error('Error fetching proforma:', proformaError);
      return NextResponse.json(
        { success: false, error: proformaError.message },
        { status: 500 }
      );
    }

    if (!proforma) {
      return NextResponse.json(
        { success: false, error: 'Proforma not found' },
        { status: 404 }
      );
    }

    // Get proforma items
    const { data: items, error: itemsError } = await supabase
      .from('proforme_items')
      .select('*')
      .eq('proforma_id', id);

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
        proforma,
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
