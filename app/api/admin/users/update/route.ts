import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function PUT(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    const body = await request.json();
    const { email, role, partner_status } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .update({ role, partner_status })
      .eq('email', email);
      
    if (error) {
      console.error('User update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Backward compatibility: allow POST as well (frontend was using POST)
export async function POST(request: NextRequest) {
  return PUT(request);
}
