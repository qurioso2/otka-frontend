import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const form = await request.formData();
  const password = String(form.get('password') || '');
  if (!password || password.length < 8) return NextResponse.json({ error: 'Parola trebuie să aibă minim 8 caractere' }, { status: 400 });

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.redirect(new URL('/parteneri/dashboard', request.url));
}
