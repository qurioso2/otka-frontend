import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, ...patch } = body || {};
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  if (patch.partner_email) {
    const { data: partner } = await supabase.from('users').select('email,role').eq('email', patch.partner_email).maybeSingle();
    if (!partner || partner.role !== 'partner') return NextResponse.json({ error: 'partner_email must belong to a partner user' }, { status: 400 });
  }

  const { error } = await supabase.from('clients').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}