import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Products API Debug ===');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    console.log('Environment:', process.env.NODE_ENV);

    // Test supabase connection
    console.log('Testing Supabase connection...');

    // Fetch products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    console.log('Supabase Query Result:');
    console.log('- Products count:', products?.length || 0);
    console.log('- Error:', error?.message || 'none');
    console.log('- Error code:', error?.code || 'none');

    if (error) {
      console.error('Detailed Error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch products', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error: any) {
    console.error('=== API Exception ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message,
      type: typeof error
    }, { status: 500 });
  }
}
