import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Using supabase from import

    // Get company settings (should only be 1 row)
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Error fetching company settings:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || null,
    });
  } catch (error: any) {
    console.error('Error in company-settings/get:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
