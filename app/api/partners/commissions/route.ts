import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Sumar comisioane din manual_orders pentru partenerul curent
  const { data, error } = await supabase
    .from('manual_orders')
    .select('status,total_net,created_at')
    .eq('partner_email', user.email);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const totals = {
    completed: 0,
    pending: 0,
    refunded: 0,
    commission_completed: 0,
    by_month: {} as Record<string, { total_net: number; commission: number }>,
  };

  (data || []).forEach((row) => {
    const net = Number((row as any).total_net || 0);
    const status = String((row as any).status || 'pending');
    if (status === 'completed') totals.completed += net;
    if (status === 'pending') totals.pending += net;
    if (status === 'refunded') totals.refunded += net;
    if (status === 'completed') totals.commission_completed += net * 0.05;
    const ym = new Date((row as any).created_at).toISOString().slice(0,7);
    if (!totals.by_month[ym]) totals.by_month[ym] = { total_net: 0, commission: 0 };
    if (status === 'completed') {
      totals.by_month[ym].total_net += net;
      totals.by_month[ym].commission += net * 0.05;
    }
  });

  return NextResponse.json(totals);
}