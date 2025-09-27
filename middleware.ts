import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res }, {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
  });

  const { data: { session } } = await supabase.auth.getSession();

  // Only specific paths should be protected, not the general /parteneri landing page
  const protectedPaths = ['/parteneri/dashboard', '/parteneri/acceptare', '/admin'];
  const isProtected = protectedPaths.some(p => {
    const path = req.nextUrl.pathname;
    // Exact match or starts with the path followed by /
    return path === p || path.startsWith(p + '/');
  });

  if (!session && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/parteneri/dashboard/:path*', '/parteneri/dashboard', '/parteneri/acceptare/:path*', '/parteneri/acceptare', '/admin/:path*', '/admin'],
};
