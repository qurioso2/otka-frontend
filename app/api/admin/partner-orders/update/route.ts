import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
    if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { order_id, status, admin_notes } = body || {};
    if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 });

    const patch: any = { status };
    if (typeof admin_notes === 'string') patch.admin_notes = admin_notes;
    if (status === 'submitted') patch.submitted_at = new Date().toISOString();

    const { error } = await supabase.from('partner_orders').update(patch).eq('id', order_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}