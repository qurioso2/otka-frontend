import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { email, company_name } = body || {};
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  // Create/Update user row as partner pending
  const { error: upsertErr } = await supabase.from('users').upsert({ email, role: 'partner', partner_status: 'pending', company_name }, { onConflict: 'email' });
  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 400 });

  // Send Supabase magic link (Supabase will send the email)
  const redirectTo = `${process.env.NEXT_PUBLIC_URL || 'https://otka.ro'}/first-login`;
  const { error: otpErr } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  if (otpErr) return NextResponse.json({ error: otpErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
