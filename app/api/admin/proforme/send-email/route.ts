import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { sendProformaEmail } from '@/lib/proformaEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, subject, message } = body;

    if (!id || !email) {
      return NextResponse.json(
        { success: false, error: 'ID and email are required' },
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
      .from('proforme_items')
      .select('*')
      .eq('proforma_id', id);

    if (itemsError) {
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }

    // Send email
    try {
      await sendProformaEmail({
        proforma: {
          ...proforma,
          items: items || []
        },
        to: email,
        subject: subject || `Proforma ${proforma.proforma_number}`,
        message: message || 'Va atasam proforma solicitata.'
      });

      // Update proforma to mark as sent
      await supabase
        .from('proforme')
        .update({
          email_sent_at: new Date().toISOString(),
          email_sent_to: email
        })
        .eq('id', id);

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      });
    } catch (emailError: any) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending proforma email:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
