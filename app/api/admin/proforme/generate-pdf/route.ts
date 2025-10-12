import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { generateProformaPDF } from '@/lib/proformaPDF';

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

    // Get proforma with items
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .select('*')
      .eq('id', id)
      .single();

    if (proformaError || !proforma) {
      return NextResponse.json(
        { success: false, error: 'Proforma not found' },
        { status: 404 }
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from('proforme_items')
      .select('*')
      .eq('proforma_id', id);

    if (itemsError) {
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }

    // Generate PDF
    try {
      const pdfBuffer = await generateProformaPDF({
        ...proforma,
        items: items || []
      });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Proforma-${proforma.full_number}.pdf"`,
        },
      });
    } catch (pdfError: any) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate PDF' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
