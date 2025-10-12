import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { getMailer } from '@/lib/mailer';

export async function POST(request: Request) {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { order_id, status, admin_notes, proforma_url, confirmation_document_url } = body || {};
    
    if (!order_id) {
      return NextResponse.json({ error: 'order_id required' }, { status: 400 });
    }

    const patch: any = {};
    if (typeof status === 'string') patch.status = status;
    if (typeof admin_notes === 'string') patch.admin_notes = admin_notes;
    if (typeof proforma_url === 'string') { 
      patch.proforma_url = proforma_url; 
      patch.proforma_generated_at = new Date().toISOString(); 
    }
    if (typeof confirmation_document_url === 'string') patch.confirmation_document_url = confirmation_document_url;
    if (status === 'submitted') patch.submitted_at = new Date().toISOString();

    const { data: orderRow, error: fetchErr } = await supabase
      .from('partner_orders')
      .select('*')
      .eq('id', order_id)
      .maybeSingle();
      
    if (fetchErr) {
      console.error('Order fetch error:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    
    if (!orderRow) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('partner_orders')
      .update(patch)
      .eq('id', order_id);
      
    if (error) {
      console.error('Order update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send notification email (best-effort)
    try {
      if (status) {
        const mailer = getMailer();
        if (mailer && orderRow.partner_email) {
          const subject = `Actualizare comandă ${orderRow.order_number || orderRow.id}: ${status}`;
          const html = `Bună,\n<br/>Statusul comenzii tale a fost actualizat la: <strong>${status}</strong>.\n<br/>Număr comandă: <strong>${orderRow.order_number || orderRow.id}</strong>.\n<br/><br/>Vă mulțumim,\n<br/>OTKA`;
          await mailer.send(orderRow.partner_email, subject, html);
        }
      }
    } catch (e) { 
      // Email sending is best-effort, don't fail the request
      console.log('Email notification failed (non-critical):', e);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Partner order update error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
