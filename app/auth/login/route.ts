import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../auth/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', error.message);
    return NextResponse.redirect(url);
  }
  return NextResponse.redirect(new URL('/parteneri/dashboard', request.url));
}
