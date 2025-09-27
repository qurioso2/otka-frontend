import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { client_id, partner_email, total_net, status = 'pending' } = body;
  if (!client_id || !partner_email || !total_net) {
    return NextResponse.json({ error: 'Client ID, partner email and total required' }, { status: 400 });
  }

  const order_id = `ORD-${Date.now()}`;
  const { data, error } = await supabase
    .from('manual_orders')
    .insert({ order_id, client_id, partner_email, total_net, status })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}
