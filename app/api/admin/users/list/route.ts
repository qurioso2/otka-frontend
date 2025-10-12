import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Unele instanțe nu au coloana created_at în tabela users. Ordonăm după email pentru compatibilitate.
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
