import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get all tax rates, ordered by sort_order
    const { data: taxRates, error } = await supabase
      .from('tax_rates')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching tax rates:', error);
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
    console.error('Error in tax-rates/list:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
