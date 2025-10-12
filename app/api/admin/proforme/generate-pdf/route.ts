import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

// Simple PDF generation without external library
export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { id } = body;

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
      return NextResponse.json({ success: false, error: 'Proforma not found' }, { status: 404 });
    }

    // Get items
    const { data: items, error: itemsError } = await supabase
      .from('proforma_items')
      .select('*')
      .eq('proforma_id', id);

    if (itemsError) {
      return NextResponse.json({ success: false, error: itemsError.message }, { status: 500 });
    }

    // Simple HTML to PDF response (browser will handle PDF generation)
    const htmlContent = `
    <html>
    <head><title>Proforma ${proforma.full_number}</title></head>
    <body style="font-family: Arial; margin: 20px;">
      <h1>PROFORMA ${proforma.full_number}</h1>
      <p><strong>Client:</strong> ${proforma.client_name}</p>
      <p><strong>Email:</strong> ${proforma.client_email}</p>
      <p><strong>Data:</strong> ${proforma.issue_date}</p>
      <hr>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr><th>Produs</th><th>Cantitate</th><th>Preț</th><th>Total</th></tr>
        ${(items || []).map((item: any) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.unit_price} RON</td>
            <td>${(item.quantity * item.unit_price).toFixed(2)} RON</td>
          </tr>
        `).join('')}
      </table>
      <hr>
      <p><strong>TOTAL: ${proforma.total_with_vat} ${proforma.currency}</strong></p>
    </body>
    </html>`;

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="Proforma-${proforma.full_number}.html"`,
      },
    });
  } catch (error: any) {
    console.error('PDF Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
