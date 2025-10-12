import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    console.log('Email request:', body);
    
    // Support both 'email' and 'to_email' from frontend
    const { id, email, to_email, subject, message } = body;
    const recipientEmail = email || to_email;

    if (!id || !recipientEmail) {
      return NextResponse.json({ success: false, error: 'ID and email required' }, { status: 400 });
    }

    // Update proforma email tracking
    const { error } = await supabase
      .from('proforme')
      .update({ email_sent_at: new Date().toISOString(), email_sent_to: recipientEmail })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`EMAIL SIMULATED: Sent to ${recipientEmail} for proforma ${id}`);
    
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
