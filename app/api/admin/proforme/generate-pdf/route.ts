import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { generateProformaPDF } from '@/lib/proformaPDF';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    console.log('Generate PDF request:', body);
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching proforma with ID:', id);

    // Get proforma
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Proforma fetch result:', { 
      hasProforma: !!proforma, 
      error: proformaError?.message,
      proformaData: proforma 
    });

    if (proformaError || !proforma) {
      console.error('Proforma fetch error:', proformaError);
      return NextResponse.json(
        { success: false, error: 'Proforma not found', details: proformaError?.message },
        { status: 404 }
      );
    }

    // Get proforma items
    const { data: items, error: itemsError } = await supabase
      .from('proforma_items')
      .select('*')
      .eq('proforma_id', id);

    console.log('Items fetch result:', { 
      itemsCount: items?.length || 0, 
      error: itemsError?.message,
      items: items 
    });

    if (itemsError) {
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }

    // Generate PDF
    try {
      console.log('Generating PDF for proforma:', proforma.full_number);
      
      const pdfBuffer = await generateProformaPDF({
        ...proforma,
        items: items || []
      });

      console.log('PDF generated successfully, size:', pdfBuffer.length);

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
        { success: false, error: 'Failed to generate PDF', details: pdfError.message },
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
