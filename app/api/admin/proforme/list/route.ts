import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Using supabase from import
    const { searchParams } = new URL(request.url);

    // Filters
    const status = searchParams.get('status'); // pending, paid, cancelled, or null for all
    const search = searchParams.get('search'); // Search in client_name, client_email, full_number
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('proforme')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);

    if (search && search.trim()) {
      query = query.or(
        `client_name.ilike.%${search}%,client_email.ilike.%${search}%,full_number.ilike.%${search}%`
      );

    // Sorting and pagination
    query = query
      .order('issue_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching proforme:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error('Error in proforme/list:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
