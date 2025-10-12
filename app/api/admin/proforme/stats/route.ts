import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Use the view we created
    const { data, error } = await supabase
      .from('proforma_stats')
      .select('*');

    if (error) {
      console.error('Error fetching proforma stats:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // If no data, return zeros
    const stats = data && data.length > 0 ? data[0] : {
      total_proforme: 0,
      total_paid: 0,
      total_pending: 0,
      total_cancelled: 0,
      suma_incasata: 0,
      suma_in_asteptare: 0,
      suma_totala: 0,
      currency: 'RON',
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in proforme/stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
