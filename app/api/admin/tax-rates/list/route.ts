import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Get all tax rates
    const { data: taxRates, error } = await supabase
      .from('tax_rates')
      .select('*')
      .order('rate', { ascending: false });

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
