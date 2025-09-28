import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    
    // Debug environment
    const debug = {
      hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      nodeEnv: process.env.NODE_ENV
    };
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const authInfo = {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message
    };

    // Check admin role if user exists
    let roleInfo = null;
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email!)
        .maybeSingle();
      
      roleInfo = {
        profile,
        profileError: profileError?.message,
        isAdmin: profile?.role === 'admin'
      };
    }

    return NextResponse.json({
      debug,
      auth: authInfo,
      role: roleInfo
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}