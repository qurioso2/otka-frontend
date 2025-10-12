import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)

    // Parse request body
    const body = await request.json();
    const { id } = body;

    // Validation
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // Check if category is used by any products
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('category', id)
      .limit(1);

    if (checkError) {
      console.error('Error checking products:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    // If category is used, just mark as inactive instead of deleting
    if (products && products.length > 0) {
      const { data: category, error } = await supabase
        .from('categories')
        .update({ active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
          error: 'Failed to deactivate category',
          details: error.message 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        category, 
        message: 'Category deactivated (used by products)' 
      });
    }

    // Delete category if not used
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to delete category',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
