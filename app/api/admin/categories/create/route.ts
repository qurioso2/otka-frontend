import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    
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
    const { name, description, icon, sort_order, active } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Create category
    const { data: category, error } = await supabase
      .from('categories')
      .insert([{
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        sort_order: sort_order !== undefined ? parseInt(sort_order) : 0,
        active: active !== undefined ? active : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'O categorie cu acest nume sau slug există deja' 
        }, { status: 409 });
      }
      return NextResponse.json({ 
        error: 'Failed to create category',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ category, message: 'Category created successfully' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
