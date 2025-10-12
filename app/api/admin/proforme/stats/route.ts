import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Get statistics for proforme
    const { data: totalCount, error: countError } = await supabase
      .from('proforme')
      .select('*', { count: 'exact', head: true });

    const { data: draftCount, error: draftError } = await supabase
      .from('proforme')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    const { data: sentCount, error: sentError } = await supabase
      .from('proforme')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent');

    const { data: paidCount, error: paidError } = await supabase
      .from('proforme')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid');

    if (countError || draftError || sentError || paidError) {
      console.error('Error fetching stats:', { countError, draftError, sentError, paidError });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    const stats = {
      total: totalCount || 0,
      draft: draftCount || 0,
      sent: sentCount || 0,
      paid: paidCount || 0
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
