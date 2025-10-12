import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {

  const { data, error } = await supabase
    .from('manual_orders')
    .select(`
      *,
      clients(name, email, company)
    `)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ orders: data || [] });
