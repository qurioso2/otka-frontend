import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Proforme Stats API Debug ===');
    console.log('Using supabaseClient (same as homepage)');
    
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

    console.log('Stats result:', stats);

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
