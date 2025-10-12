import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const end = new Date(start); end.setMonth(start.getMonth() + 1);

  const { data, error } = await supabase
    .from('manual_orders')
    .select('partner_email, total_net, status, created_at')
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const map: Record<string, { total_net: number; commission: number; orders: number }> = {};
  for (const row of data || []) {
    if (row.status !== 'completed') continue;
    const key = row.partner_email as string;
    if (!map[key]) map[key] = { total_net: 0, commission: 0, orders: 0 };
    map[key].total_net += Number(row.total_net || 0);
    map[key].orders += 1;
  Object.keys(map).forEach(k => { map[k].commission = map[k].total_net * 0.05; });

  return NextResponse.json({ month: start.toISOString().slice(0,7), summary: map });
