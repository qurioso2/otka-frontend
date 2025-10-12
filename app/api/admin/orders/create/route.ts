import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { client_id, total_net, total_vat = 0, total_gross, status = 'completed', note } = body || {};
  if (!client_id || !total_net || !total_gross) {
    return NextResponse.json({ error: 'client_id, total_net, total_gross are required' }, { status: 400 });
  }

  // Fetch client to get partner_email
  const { data: client, error: clientErr } = await supabase.from('clients').select('id, partner_email').eq('id', client_id).maybeSingle();
  if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 400 });
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const payload = {
    client_id: Number(client_id),
    partner_email: client.partner_email as string,
    total_net: Number(total_net),
    total_vat: Number(total_vat || 0),
    total_gross: Number(total_gross),
    status,
    note: note || null,
  };

  const { data, error } = await supabase.from('manual_orders').insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ order: data });
}