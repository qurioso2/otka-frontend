import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Using supabase from import
    const body = await request.json();

    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Update status to paid and set confirmed_at
    const { data, error } = await supabase
      .from('proforme')
      .update({
        status: 'paid',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error confirming proforma:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // TODO: Here you can add logic to:
    // 1. Decrease stock for all products in proforma_items
    // 2. Send confirmation email to client

    return NextResponse.json({
      success: true,
      data,
      message: 'Proforma confirmed and marked as paid',
    });
  } catch (error: any) {
    console.error('Error in proforme/confirm:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
