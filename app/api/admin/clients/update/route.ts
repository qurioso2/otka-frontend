import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    const { id, ...patch } = body || {};
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    if (patch.partner_email) {
      const { data: partner } = await supabase
        .from('users')
        .select('email,role')
        .eq('email', patch.partner_email)
        .maybeSingle();
        
      if (!partner || partner.role !== 'partner') {
        return NextResponse.json({ error: 'partner_email must belong to a partner user' }, { status: 400 });
      }
    }

    const { error } = await supabase
      .from('clients')
      .update(patch)
      .eq('id', id);
      
    if (error) {
      console.error('Client update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
