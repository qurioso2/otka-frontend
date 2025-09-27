import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { client_id, total_net, total_vat, total_gross, status, note } = body || {};
  if (!client_id || total_net == null || total_gross == null) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const { data: client } = await supabase.from('clients').select('partner_email').eq('id', client_id).maybeSingle();
  const partner_email = client?.partner_email || user.email;

  const { data, error } = await supabase.from('manual_orders').insert({ client_id, partner_email, total_net, total_vat, total_gross, status, note }).select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data?.[0]?.id });
}
