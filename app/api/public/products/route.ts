import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = Math.min(parseInt(searchParams.get('limit') || '18'), 60);
  const category = searchParams.get('category'); // Filter by category
  const sort = searchParams.get('sort') || 'default'; // Sort by price
  const search = searchParams.get('search'); // Search query
  const brand = searchParams.get('brand'); // Filter by brand

  const supabase = await getServerSupabase();
  
  // Build query
  let query = supabase
    .from('products_public')
    .select('id,sku,name,slug,price_public_ttc,price_original,stock_qty,gallery,description,category,brand_name,brand_id');

  // Apply search filter
  if (search && search.trim()) {
    query = query.or(`name.ilike.%${search.trim()}%,sku.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
  }

  // Apply category filter if provided
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Apply brand filter if provided
  if (brand && brand !== 'all') {
    query = query.eq('brand_name', brand);
  }

  // Apply sorting
  if (sort === 'price_asc') {
    query = query.order('price_public_ttc', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price_public_ttc', { ascending: false });
  } else if (sort === 'brand') {
    query = query.order('brand_name', { ascending: true, nullsFirst: false });
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
