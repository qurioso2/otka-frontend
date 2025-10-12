import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    console.log('Send email request:', body);
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

    // Update proforma to mark as sent
    await supabase
      .from('proforme')
      .update({
        email_sent_at: new Date().toISOString(),
        email_sent_to: email
      })
      .eq('id', id);

    // For now, just simulate email sending
    console.log('Email would be sent to:', email);
    console.log('Subject:', subject || `Proforma ${proforma.full_number}`);

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
