import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { id } = body;

    console.log('=== PDF GENERATION START ===');
    console.log('Proforma ID:', id);

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Get proforma
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .select('*')
      .eq('id', id)
      .single();

    if (proformaError || !proforma) {
      console.error('Proforma not found:', proformaError);
      return NextResponse.json({ success: false, error: 'Proforma not found' }, { status: 404 });
    }

    console.log('Proforma loaded:', proforma.full_number);

    // Get items
    const { data: items, error: itemsError } = await supabase
      .from('proforma_items')
      .select('*')
      .eq('proforma_id', id);

    if (itemsError) {
      console.error('Items error:', itemsError);
    }

    console.log('Items loaded:', items?.length || 0);

    // Get company settings
    const { data: settings } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    console.log('Company settings loaded');

    // Try to generate PDF with pdf-lib
    try {
      console.log('Attempting PDF generation with pdf-lib...');
      const { generateProformaPDF } = await import('@/lib/proformaPDFGenerator');
      const pdfBytes = await generateProformaPDF(proforma, items || [], settings || {});

      console.log('=== PDF GENERATED SUCCESSFULLY ===');
      console.log('PDF size:', pdfBytes.length, 'bytes');

      // Return PDF as buffer
      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Proforma-${proforma.full_number}.pdf"`,
          'Content-Length': pdfBytes.length.toString(),
        },
      });
    } catch (pdfError: any) {
      console.error('=== PDF GENERATION FAILED ===');
      console.error('PDF Error:', pdfError.message);
      console.error('Stack:', pdfError.stack);
      
      // Return error instead of HTML fallback
      return NextResponse.json({ 
        success: false, 
        error: `PDF generation failed: ${pdfError.message}. Verifică că pdf-lib este instalat corect.` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('=== CRITICAL ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
