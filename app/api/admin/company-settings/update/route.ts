import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Company Settings Update (using getServerSupabase) ===');
    
    const body = await request.json();
    console.log('Update request body:', body);

    const supabase = await getServerSupabase();

    // Check if settings exist
    const { data: existing } = await supabase
      .from('company_settings')
      .select('id')
      .limit(1)
      .single();

    console.log('Existing settings check:', { hasExisting: !!existing });

    let result;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('company_settings')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company settings:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('company_settings')
        .insert(body)
        .select()
        .single();

      if (error) {
        console.error('Error creating company settings:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log('Settings operation result:', result);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in company-settings/update:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
