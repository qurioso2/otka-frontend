import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
    supabase_anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    supabase_service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    all_env_keys: Object.keys(process.env).filter(key => 
      key.includes('SUPABASE') || key.includes('DATABASE')
    ).sort(),
  });
}