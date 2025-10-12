import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    const body = await request.json();
    const { name, rate, description, active = true } = body;

    if (!name || rate === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name and rate are required' },
        { status: 400 }
      );
    }

    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      return NextResponse.json(
        { success: false, error: 'Rate must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Create tax rate
    const { data, error } = await supabase
      .from('tax_rates')
      .insert({
        name: name.trim(),
        rate,
        description: description?.trim() || null,
        active
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tax rate:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'A tax rate with this name already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in tax-rates/create:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
