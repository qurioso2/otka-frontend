import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url));
}
