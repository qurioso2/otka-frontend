import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { email, company_name, contact_name, vat_id } = body;
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const magic_token = nanoid(32);
  const { error } = await supabase.from('users').insert({
    email,
    company_name,
    contact_name,
    vat_id,
    role: 'partner',
    partner_status: 'invited',
    magic_token,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const magicLink = `${process.env.NEXT_PUBLIC_URL}/first-login?token=${magic_token}`;
  return NextResponse.json({ magicLink });
}
