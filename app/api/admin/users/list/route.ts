import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  try {
    console.log('=== Users API (using getServerSupabase) ===');

    const supabase = await getServerSupabase();

    const { data, error } = await supabase.from('users').select('*').order('email', { ascending: true });
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (error: any) {
    console.error('Users list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
