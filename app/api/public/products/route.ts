import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = Math.min(parseInt(searchParams.get('limit') || '18'), 60);
  const category = searchParams.get('category'); // Filter by category
  const sort = searchParams.get('sort') || 'default'; // Sort by price

  const supabase = await getServerSupabase();
  
  // Build query
  let query = supabase
    .from('products_public')
    .select('id,sku,name,slug,price_public_ttc,price_original,stock_qty,gallery,description,category,brand_name');

  // Apply category filter if provided
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Apply sorting
  if (sort === 'price_asc') {
    query = query.order('price_public_ttc', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price_public_ttc', { ascending: false });
  } else {
    // Default: newest first
    query = query.order('id', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}