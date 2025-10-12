import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, rate, description, active } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    if (rate !== undefined && (typeof rate !== 'number' || rate < 0 || rate > 100)) {
      return NextResponse.json(
        { success: false, error: 'Rate must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (rate !== undefined) updateData.rate = rate;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (active !== undefined) updateData.active = active;

    // Update tax rate
    const { data, error } = await supabase
      .from('tax_rates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tax rate:', error);
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
    console.error('Error in tax-rates/update:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
