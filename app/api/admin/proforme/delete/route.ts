import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

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

    // Delete proforma (cascade will delete items)
    const { error } = await supabase
      .from('proforme')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting proforma:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );

    return NextResponse.json({
      success: true,
      message: 'Proforma deleted',
    });
  } catch (error: any) {
    console.error('Error in proforme/delete:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
