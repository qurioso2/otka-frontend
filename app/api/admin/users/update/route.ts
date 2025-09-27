import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { email, role, partner_status, company_name, vat_id, contact_name, phone } = body || {};
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const { data, error } = await supabase.from('users').upsert({ email, role, partner_status, company_name, vat_id, contact_name, phone }, { onConflict: 'email' }).select('email');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, email: data?.[0]?.email });
}
