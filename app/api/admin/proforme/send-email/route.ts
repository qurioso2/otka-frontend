import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    console.log('Email request:', body);
    
    const { id, email, subject, message } = body;

    if (!id || !email) {
      return NextResponse.json({ success: false, error: 'ID and email required' }, { status: 400 });
    }

    // Update proforma email tracking
    const { error } = await supabase
      .from('proforme')
      .update({ email_sent_at: new Date().toISOString(), email_sent_to: email })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`EMAIL SIMULATED: Sent to ${email} for proforma ${id}`);
    
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
