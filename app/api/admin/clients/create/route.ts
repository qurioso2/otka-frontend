import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { name, email, phone, company, partner_email } = body;
  if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
  if (!partner_email) return NextResponse.json({ error: 'partner_email required' }, { status: 400 });

  // Validate partner exists and is partner role
  const { data: partner } = await supabase.from('users').select('email, role').eq('email', partner_email).maybeSingle();
  if (!partner || partner.role !== 'partner') return NextResponse.json({ error: 'partner_email must belong to a partner user' }, { status: 400 });

  const { data, error } = await supabase.from('clients').insert({ name, email, phone, company, partner_email }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ client: data });
}