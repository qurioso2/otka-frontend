import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    
    console.log('=== EMAIL SEND REQUEST ===');
    console.log('Body:', JSON.stringify(body, null, 2));
    
    // Support both 'email' and 'to_email' from frontend
    const { id, email, to_email, subject, message } = body;
    const recipientEmail = email || to_email;

    if (!id || !recipientEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID și email sunt obligatorii' 
      }, { status: 400 });
    }

    console.log('Proforma ID:', id);
    console.log('Recipient:', recipientEmail);

    // Get proforma data
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .select('*')
      .eq('id', id)
      .single();

    if (proformaError || !proforma) {
      console.error('Proforma not found:', proformaError);
      return NextResponse.json({ 
        success: false, 
        error: 'Proforma nu a fost găsită' 
      }, { status: 404 });
    }

    console.log('Proforma loaded:', proforma.full_number);

    // Get proforma items
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

    console.log('Settings loaded');

    // Check SMTP env vars
    const smtpHost = process.env.ZOHO_SMTP_HOST;
    const smtpUser = process.env.ZOHO_SMTP_USER;
    const smtpPass = process.env.ZOHO_SMTP_PASS;
    const fromEmail = process.env.ZOHO_FROM_EMAIL;

    console.log('SMTP Config check:', {
      host: smtpHost ? '✅' : '❌',
      user: smtpUser ? '✅' : '❌',
      pass: smtpPass ? '✅' : '❌',
      from: fromEmail ? '✅' : '❌'
    });

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      console.error('SMTP credentials missing!');
      
      // Update tracking anyway
      await supabase
        .from('proforme')
        .update({ 
          email_sent_at: new Date().toISOString(), 
          email_sent_to: recipientEmail 
        })
        .eq('id', id);

      return NextResponse.json({ 
        success: false, 
        error: 'Configurare SMTP lipsă. Verifică environment variables în Vercel: ZOHO_SMTP_HOST, ZOHO_SMTP_USER, ZOHO_SMTP_PASS, ZOHO_FROM_EMAIL' 
      }, { status: 500 });
    }

    // Try to send email
    try {
      console.log('Attempting to import mailer and PDF generator...');
      
      const { sendZohoMail } = await import('@/lib/mailer');
      const { generateProformaPDF } = await import('@/lib/proformaPDFGenerator');

      console.log('Libraries imported successfully');

      // Generate PDF
      console.log('Generating PDF...');
      const pdfBytes = await generateProformaPDF(proforma, items || [], settings || {});
      console.log('PDF generated:', pdfBytes.length, 'bytes');

      // Prepare email
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

      console.log('Sending email to:', recipientEmail);

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

      console.log('✅ Email sent successfully!');

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
      }

      console.log('=== EMAIL SENT SUCCESSFULLY ===');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email trimis cu succes cu PDF atașat!' 
      });

    } catch (emailError: any) {
      console.error('=== EMAIL SENDING FAILED ===');
      console.error('Error:', emailError.message);
      console.error('Stack:', emailError.stack);

      return NextResponse.json({ 
        success: false, 
        error: `Email nu a putut fi trimis: ${emailError.message}` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('=== CRITICAL ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Eroare la trimiterea emailului' 
    }, { status: 500 });
  }
}
