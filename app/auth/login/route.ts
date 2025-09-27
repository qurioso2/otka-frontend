import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../auth/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // Redirect only on success
  return NextResponse.redirect(new URL('/parteneri/dashboard', request.url));
}