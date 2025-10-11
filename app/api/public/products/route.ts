import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = Math.min(parseInt(searchParams.get('limit') || '18'), 60);

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('products_public')
    .select('id,sku,name,slug,price_public_ttc,price_original,stock_qty,gallery,description')
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}