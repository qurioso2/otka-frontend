import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Proforme List API Debug ===');
    console.log('Using getServerSupabase (same as create)');
    
    const supabase = await getServerSupabase();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('proforme')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    console.log('Proforme query params:', { page, limit, offset, status });

    const { data, error, count } = await query;

    console.log('Proforme result:', { 
      proformeCount: data?.length || 0, 
      totalCount: count || 0,
      hasError: !!error,
      errorMessage: error?.message,
      firstProforma: data?.[0] 
    });

    if (error) {
      console.error('Error fetching proforme:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

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
  }
}
