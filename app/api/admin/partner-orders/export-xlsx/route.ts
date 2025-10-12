import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('partner_orders')
    .select('id,order_number,partner_email,status,created_at,submitted_at,partner_notes,admin_notes,partner_order_items(quantity,partner_price)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = (data || []).map((o: any) => {
    const items = Array.isArray(o.partner_order_items) ? o.partner_order_items : [];
    const total_gross = items.reduce((sum: number, it: any) => sum + (Number(it.partner_price || 0) * Number(it.quantity || 0)), 0);
    return {
      ID: o.id,
      Numar: o.order_number,
      Partener: o.partner_email,
      Status: o.status,
      'Creat la': o.created_at,
      'Trimis la': o.submitted_at || '',
      'Produse (nr)': items.length,
      'Total brut (RON)': total_gross,
      'Note partener': o.partner_notes || '',
      'Note admin': o.admin_notes || ''
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Comenzi Parteneri');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="comenzi-parteneri.xlsx"'
    }
  });
}