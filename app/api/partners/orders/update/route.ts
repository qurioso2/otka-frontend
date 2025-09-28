import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, patch } = body || {};
  if (!id || !patch) return NextResponse.json({ error: 'id și patch necesare' }, { status: 400 });

  // Încredințăm RLS-ului permisiunea. Va reuși dacă politica permite update pentru partenerul curent.
  const { error } = await supabase.from('partner_orders').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}