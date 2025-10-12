import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

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
      console.error('Items error:', itemsError);
      // Continue with empty items
    }

    // Get company settings
    const { data: settings } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    // Try to generate PDF
    try {
      const { generateProformaPDF } = await import('@/lib/proformaPDFGenerator');
      const pdfBytes = await generateProformaPDF(proforma, items || [], settings || {});

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
      console.error('PDF generation error:', pdfError);
      
      // Fallback: Return simple HTML that can be saved as PDF by browser
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Proforma ${proforma.full_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>PROFORMA ${proforma.full_number}</h1>
          <p><strong>Client:</strong> ${proforma.client_name}</p>
          <p><strong>Email:</strong> ${proforma.client_email || 'N/A'}</p>
          <p><strong>Data:</strong> ${proforma.issue_date}</p>
          ${proforma.client_address ? `<p><strong>Adresă:</strong> ${proforma.client_address}</p>` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Produs</th>
                <th>Cantitate</th>
                <th>Preț unitar</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(items || []).map((item: any, idx: number) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)} ${proforma.currency}</td>
                  <td>${(item.quantity * item.unit_price).toFixed(2)} ${proforma.currency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 30px;">
            <p><strong>Subtotal (fără TVA):</strong> ${proforma.subtotal_no_vat.toFixed(2)} ${proforma.currency}</p>
            <p><strong>TVA (19%):</strong> ${proforma.total_vat.toFixed(2)} ${proforma.currency}</p>
            <p class="total" style="font-size: 20px; color: #c00;">TOTAL: ${proforma.total_with_vat.toFixed(2)} ${proforma.currency}</p>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p><strong>Detalii plată:</strong></p>
            <p>Banca: ${settings?.bank_name || 'BANCA TRANSILVANIA'}</p>
            <p>IBAN (RON): ${settings?.iban_ron || 'RO87BTRLRONCRT0CX2815301'}</p>
            <p>IBAN (EUR): ${settings?.iban_eur || 'RO34BTRLEURCRT0CX2815301'}</p>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="Proforma-${proforma.full_number}.html"`,
        },
      });
    }
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
