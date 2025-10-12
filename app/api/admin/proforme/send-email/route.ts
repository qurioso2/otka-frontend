import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { sendZohoMail } from '@/lib/mailer';
import { generateProformaPDF } from '@/lib/proformaPDFGenerator';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    console.log('Email request:', body);
    
    // Support both 'email' and 'to_email' from frontend
    const { id, email, to_email, subject, message } = body;
    const recipientEmail = email || to_email;

    if (!id || !recipientEmail) {
      return NextResponse.json({ success: false, error: 'ID și email sunt obligatorii' }, { status: 400 });
    }

    // Get proforma data
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .select('*')
      .eq('id', id)
      .single();

    if (proformaError || !proforma) {
      return NextResponse.json({ success: false, error: 'Proforma nu a fost găsită' }, { status: 404 });
    }

    // Get proforma items
    const { data: items, error: itemsError } = await supabase
      .from('proforma_items')
      .select('*')
      .eq('proforma_id', id);

    if (itemsError) {
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea produselor' }, { status: 500 });
    }

    // Get company settings
    const { data: settings } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    // Generate PDF
    const pdfBytes = await generateProformaPDF(proforma, items || [], settings || {});

    // Send email with PDF attachment
    const emailSubject = subject || `Proforma ${proforma.full_number} - OTKA.ro`;
    const emailHtml = message || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Proforma ${proforma.full_number}</h2>
        <p>Bună ziua,</p>
        <p>Vă mulțumim pentru comanda dumneavoastră!</p>
        <p>Atașat găsiți proforma <strong>${proforma.full_number}</strong> în sumă de <strong>${proforma.total_with_vat.toFixed(2)} ${proforma.currency}</strong>.</p>
        <p><strong>Detalii plată:</strong></p>
        <ul>
          <li>Banca: ${settings?.bank_name || 'BANCA TRANSILVANIA'}</li>
          <li>IBAN (RON): ${settings?.iban_ron || 'RO87BTRLRONCRT0CX2815301'}</li>
          <li>IBAN (EUR): ${settings?.iban_eur || 'RO34BTRLEURCRT0CX2815301'}</li>
        </ul>
        <p>Pentru întrebări, ne puteți contacta la <a href="mailto:salut@otka.ro">salut@otka.ro</a></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          ${settings?.company_name || 'MERCURY VC S.R.L.'}<br>
          CIF: ${settings?.cui || 'RO48801623'}<br>
          ${settings?.address || 'Bld. Eroilor, Nr.42, Et.I, Ap.9'}<br>
          ${settings?.city || 'Cluj-Napoca'}, Jud.: ${settings?.county || 'Cluj'}
        </p>
      </div>
    `;

    // Send email using Zoho SMTP
    await sendZohoMail({
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
      attachments: [{
        filename: `Proforma-${proforma.full_number}.pdf`,
        content: Buffer.from(pdfBytes),
      }],
    });

    // Update proforma email tracking
    const { error: updateError } = await supabase
      .from('proforme')
      .update({ 
        email_sent_at: new Date().toISOString(), 
        email_sent_to: recipientEmail 
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update email tracking:', updateError);
      // Don't fail the request if tracking update fails
    }

    console.log(`✅ Email sent to ${recipientEmail} for proforma ${proforma.full_number}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email trimis cu succes cu PDF atașat!' 
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Eroare la trimiterea emailului' 
    }, { status: 500 });
  }
}
