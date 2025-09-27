import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { email, name, company, partner_email } = body || {};
  const partner = partner_email || user.email;
  if (!partner) return NextResponse.json({ error: 'Missing partner' }, { status: 400 });

  const { data, error } = await supabase.from('clients').insert({ email, name, company, partner_email: partner }).select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data?.[0]?.id });
}
