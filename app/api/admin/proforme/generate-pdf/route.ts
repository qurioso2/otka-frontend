import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { generateProformaPDF } from '@/lib/proformaPDF';

export async function POST(request: NextRequest) {
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
      .from('proforma_items')
      .select('*')
      .eq('proforma_id', id)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }

    // Get company settings
    const { data: settings, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: settingsError.message },
        { status: 500 }
      );
    }

    // Generate PDF
    const pdfBytes = await generateProformaPDF(
      {
        ...proforma,
        items: items || [],
      },
      settings || {}
    );

    // TODO: Upload PDF to Supabase Storage or R2 and save URL
    // For now, return PDF directly

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Proforma-${proforma.full_number}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
