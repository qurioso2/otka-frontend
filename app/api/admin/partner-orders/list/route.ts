import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    
    const { data, error } = await supabase
      .from('partner_orders')
      .select(`
        *,
        partner_order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Partner orders fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
    console.error('Partner orders list error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
