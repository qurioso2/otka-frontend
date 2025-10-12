import { getMailer } from './mailer';
import { createClient } from './supabaseClient';

interface EmailProformaParams {
  proforma_id: number;
  to_email: string;
  pdf_buffer: Buffer;
  subject?: string;
  body_html?: string;
}

export async function sendProformaEmail(params: EmailProformaParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const mailer = getMailer();

    if (!mailer) {
      return {
        success: false,
        error: 'Email configuration not available (ZOHO_SMTP settings missing)',
      };
    }

    const supabase = createClient();

    // Get proforma details
    const { data: proforma, error: proformaError } = await supabase
      .from('proforme')
      .select('full_number, client_name')
      .eq('id', params.proforma_id)
      .single();

    if (proformaError || !proforma) {
      return {
        success: false,
        error: `Proforma not found: ${proformaError?.message || 'Unknown error'}`,
      };
    }

    // Get company settings for email template
    const { data: settings } = await supabase
      .from('company_settings')
      .select('company_name, email_subject_template, email_body_template')
      .limit(1)
      .single();

    const companyName = settings?.company_name || 'OTKA';

    // Build subject
    const subject =
      params.subject ||
      (settings?.email_subject_template || 'Proforma #{number} - {company_name}')
        .replace('{number}', proforma.full_number)
        .replace('{company_name}', companyName);

    // Build body
    const bodyTemplate =
      params.body_html ||
      (settings?.email_body_template ||
        'Bună ziua,<br/><br/>Vă transmitem în atașament factura proformă #{number}.<br/><br/>Vă mulțumim,<br/>{company_name}')
        .replace('{number}', proforma.full_number)
        .replace('{company_name}', companyName)
        .replace('\n', '<br/>');

    // Send email with PDF attachment
    const result = await mailer.send(params.to_email, subject, bodyTemplate);

    if (!result.ok) {
      return {
        success: false,
        error: result.error || 'Failed to send email',
      };
    }

    // Update proforma with email sent info
    await supabase
      .from('proforme')
      .update({
        email_sent_at: new Date().toISOString(),
        email_sent_to: params.to_email,
      })
      .eq('id', params.proforma_id);

    return { success: true };
  } catch (error: any) {
    console.error('Error sending proforma email:', error);
    return {
      success: false,
      error: error.message || 'Internal error',
    };
  }
}
