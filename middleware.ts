import { NextResponse } from 'next/server';
import { getServerSupabase } from './app/auth/server';

export async function middleware(request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/parteneri')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/parteneri/:path*'],
};