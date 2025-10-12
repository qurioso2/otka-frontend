import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Using supabase from import

    // Get only active tax rates for public use
    const { data: taxRates, error } = await supabase
      .from('tax_rates')
      .select('id, name, rate')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching public tax rates:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: taxRates || [],
    });
  } catch (error: any) {
    console.error('Error in public/tax-rates/list:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
