import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, items, partner_notes } = body || {};
  if (!id || !Array.isArray(items)) return NextResponse.json({ error: 'id și items necesare' }, { status: 400 });

  // Fetch order and verify ownership + draft status
  const { data: order, error: errOrder } = await supabase.from('partner_orders').select('*').eq('id', id).maybeSingle();
  if (errOrder) return NextResponse.json({ error: errOrder.message }, { status: 400 });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.partner_email !== user.email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (order.status !== 'draft') return NextResponse.json({ error: 'Doar comenzile în draft pot fi editate' }, { status: 400 });

  // Replace items (simple approach)
  const { error: delErr } = await supabase.from('partner_order_items').delete().eq('order_id', id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

  const rows = items.map((it: any, index: number) => ({
    order_id: id,
    row_number: it.rowNumber ?? index + 1,
    manufacturer_name: it.manufacturerName,
    product_code: it.productCode,
    quantity: Number(it.quantity || 1),
    finish_code: it.finishCode || null,
    partner_price: it.partnerPrice != null ? Number(it.partnerPrice) : null,
  }));

  const { error: insErr } = await supabase.from('partner_order_items').insert(rows);
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  if (typeof partner_notes === 'string') {
    const { error: upErr } = await supabase.from('partner_orders').update({ partner_notes }).eq('id', id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}