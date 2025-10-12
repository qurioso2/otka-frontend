import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { client_id, total_net, total_vat = 0, total_gross, status = 'completed', note } = body || {};
    
    if (!client_id || !total_net || !total_gross) {
      return NextResponse.json({ error: 'client_id, total_net, total_gross are required' }, { status: 400 });
    }

    // Fetch client to get partner_email
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('id, partner_email')
      .eq('id', client_id)
      .maybeSingle();
      
    if (clientErr) {
      console.error('Client fetch error:', clientErr);
      return NextResponse.json({ error: clientErr.message }, { status: 500 });
    }
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const payload = {
      client_id: Number(client_id),
      partner_email: client.partner_email as string,
      total_net: Number(total_net),
      total_vat: Number(total_vat || 0),
      total_gross: Number(total_gross),
      status,
      note: note || null,
    };

    const { data, error } = await supabase
      .from('manual_orders')
      .insert(payload)
      .select()
      .single();
      
    if (error) {
      console.error('Order creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
