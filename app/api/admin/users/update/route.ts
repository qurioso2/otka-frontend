import { NextResponse, NextRequest } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function PUT(request: NextRequest) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { email, role, partner_status } = body;
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const { error } = await supabase.from('users').update({ role, partner_status }).eq('email', email);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
