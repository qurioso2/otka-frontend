import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email!)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { id } = body;

    // Validation
    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    // Check if brand is used by any products
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('brand_id', id)
      .limit(1);

    if (checkError) {
      console.error('Error checking products:', checkError);
    }

    // If brand is used, just mark as inactive instead of deleting
    if (products && products.length > 0) {
      const { data: brand, error } = await supabase
        .from('brands')
        .update({ active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
          error: 'Failed to deactivate brand',
          details: error.message 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        brand, 
        message: 'Brand dezactivat (folosit de produse)' 
      });
    }

    // Delete brand if not used
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to delete brand',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Brand șters cu succes' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
