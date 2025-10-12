import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();
    const body = await request.json();
    console.log('Delete proforma request:', body);
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Delete proforma items first (foreign key constraint)
    const { error: itemsDeleteError } = await supabase
      .from('proforma_items')
      .delete()
      .eq('proforma_id', id);

    if (itemsDeleteError) {
      console.error('Error deleting proforma items:', itemsDeleteError);
    }

    // Delete proforma
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
    }

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
  }
}
