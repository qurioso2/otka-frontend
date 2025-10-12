import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Updates array is required' },
        { status: 400 }
      );
    }

    // Bulk update tax rates
    let affectedCount = 0;
    for (const update of updates) {
      const { id, rate } = update;
      if (id && rate !== undefined) {
        const { error } = await supabase
          .from('tax_rates')
          .update({ rate })
          .eq('id', id);
        if (!error) affectedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      affected_count: affectedCount,
      message: `Updated ${affectedCount} tax rates`,
    });
  } catch (error: any) {
    console.error('Error in tax-rates/bulk-update:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
