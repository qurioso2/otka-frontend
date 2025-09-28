import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
    if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase
      .from('partner_orders')
      .select(`
        id,
        order_number,
        partner_email,
        status,
        created_at,
        submitted_at,
        partner_notes,
        admin_notes,
        partner_order_items(quantity, partner_price)
      `)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const orders = (data || []).map((o: any) => {
      const items = Array.isArray(o.partner_order_items) ? o.partner_order_items : [];
      const items_count = items.length;
      const total_gross = items.reduce((sum: number, it: any) => sum + (Number(it.partner_price || 0) * Number(it.quantity || 0)), 0);
      return {
        id: o.id,
        order_number: o.order_number,
        partner_email: o.partner_email,
        status: o.status,
        created_at: o.created_at,
        submitted_at: o.submitted_at,
        total_gross,
        items_count,
        partner_notes: o.partner_notes,
        admin_notes: o.admin_notes,
      };
    });

    return NextResponse.json({ orders });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}