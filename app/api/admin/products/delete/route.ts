import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
    // Verify admin access
    }
    }

    // Parse request body
    const body = await request.json();
    const { id } = body;

    // Validation
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('Deleting product with ID:', id);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error details:', error);
      return NextResponse.json({ 
        error: 'Failed to delete product', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
