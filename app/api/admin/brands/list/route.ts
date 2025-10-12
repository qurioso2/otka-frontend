import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)

    // Get all brands
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching brands:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Brands list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
