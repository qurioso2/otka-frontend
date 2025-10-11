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
    const { name, description, logo_url, website, sort_order, active } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ă/g, 'a')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Create brand
    const { data: brand, error } = await supabase
      .from('brands')
      .insert([{
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        logo_url: logo_url?.trim() || null,
        website: website?.trim() || null,
        sort_order: sort_order !== undefined ? parseInt(sort_order) : 0,
        active: active !== undefined ? active : true
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'Un brand cu acest nume sau slug există deja' 
        }, { status: 409 });
      }
      return NextResponse.json({ 
        error: 'Failed to create brand',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ brand, message: 'Brand created successfully' });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
