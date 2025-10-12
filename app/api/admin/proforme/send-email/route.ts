import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { generateProformaPDF } from '@/lib/proformaPDF';
import { getMailer } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { id, to_email } = body;

    if (!id || !to_email) {
      return NextResponse.json(
        { success: false, error: 'id and to_email are required' },
        { status: 400 }
      );
    }

    const mailer = getMailer();
    if (!mailer) {
      return NextResponse.json(
        { success: false, error: 'Email configuration not available' },
        { status: 500 }
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

    const { data: items } = await supabase
      .from('proforma_items')
      .select('*')
      .eq('proforma_id', id)
      .order('sort_order', { ascending: true });

    // Get company settings
    const { data: settings } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    const companyName = settings?.company_name || 'OTKA';

    // Generate PDF
    const pdfBytes = await generateProformaPDF(
      {
        ...proforma,
        items: items || [],
      },
      settings || {}
    );

    // Build email subject and body
    const subject = (settings?.email_subject_template || 'Proforma #{number} - {company_name}')
      .replace('{number}', proforma.full_number)
      .replace('{company_name}', companyName);

    const bodyHtml = (settings?.email_body_template ||
      'Bună ziua,<br/><br/>Vă transmitem în atașament factura proformă #{number}.<br/><br/>Vă mulțumim,<br/>{company_name}')
      .replace('{number}', proforma.full_number)
      .replace('{company_name}', companyName)
      .replace(/\n/g, '<br/>');

    // Send email with attachment
    // Note: nodemailer's sendMail accepts attachments array
    // We need to modify the mailer.send to support attachments
    // For now, we'll call sendMail directly

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: Number(process.env.ZOHO_SMTP_PORT || 465),
      secure: Number(process.env.ZOHO_SMTP_PORT || 465) === 465,
      auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.ZOHO_FROM_EMAIL || process.env.ZOHO_SMTP_USER,
      to: to_email,
      subject,
      html: bodyHtml,
      attachments: [
        {
          filename: `Proforma-${proforma.full_number}.pdf`,
          content: Buffer.from(pdfBytes),
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Update proforma
    await supabase
      .from('proforme')
      .update({
        email_sent_at: new Date().toISOString(),
        email_sent_to: to_email,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending proforma email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
