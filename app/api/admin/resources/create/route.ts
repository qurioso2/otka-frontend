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
    const {
      name,
      description,
      file_type,
      file_url,
      visible,
      partner_access
    } = body;

    // Validation
    if (!name || !file_type || !file_url) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, file_type, file_url' 
      }, { status: 400 });
    }

    // Create resource
    const { data: resource, error } = await supabase
      .from('partner_resources')
      .insert([{
        name,
        description,
        file_type,
        file_url,
        visible: visible !== false,
        partner_access: partner_access !== false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
    }

    return NextResponse.json({ resource, message: 'Resource created successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}