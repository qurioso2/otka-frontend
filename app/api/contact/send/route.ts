import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Toate campurile obligatorii trebuie completate' 
      }, { status: 400 });
    }

    // Check SMTP configuration
    const smtpHost = process.env.ZOHO_SMTP_HOST;
    const smtpUser = process.env.ZOHO_SMTP_USER;
    const smtpPass = process.env.ZOHO_SMTP_PASS;
    const fromEmail = process.env.ZOHO_FROM_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      console.error('SMTP not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Serviciul de email nu este configurat' 
      }, { status: 500 });
    }

    // Send email
    const { sendZohoMail } = await import('@/lib/mailer');

    const emailSubject = `[Contact OTKA.ro] ${subject}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Mesaj nou de contact</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nume:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
          <p><strong>Subiect:</strong> ${subject}</p>
        </div>
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Mesaj:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Acest mesaj a fost trimis prin formularul de contact de pe OTKA.ro
        </p>
      </div>
    `;

    await sendZohoMail({
      to: 'salut@otka.ro', // Your company email
      replyTo: email, // User's email for easy reply
      subject: emailSubject,
      html: emailHtml,
    });

    // Optionally send confirmation email to user
    try {
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Multumim pentru mesaj!</h2>
          <p>Buna ziua ${name},</p>
          <p>Am primit mesajul dumneavoastra si vom reveni cu un raspuns in cel mai scurt timp posibil.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Subiect:</strong> ${subject}</p>
            <p><strong>Mesajul dumneavoastra:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>Cu stima,<br>Echipa OTKA.ro</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            Pentru intrebari suplimentare, ne puteti contacta la salut@otka.ro
          </p>
        </div>
      `;

      await sendZohoMail({
        to: email,
        subject: 'Confirmare mesaj - OTKA.ro',
        html: confirmationHtml,
      });
    } catch (confirmError) {
      console.error('Failed to send confirmation email:', confirmError);
      // Don't fail the main request
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mesaj trimis cu succes!' 
    });

  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Eroare la trimiterea mesajului' 
    }, { status: 500 });
  }
}
