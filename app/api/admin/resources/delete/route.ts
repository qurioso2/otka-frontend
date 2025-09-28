import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '../../auth/server';

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
    const { resource_id } = body;

    if (!resource_id) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Delete resource
    const { error } = await supabase
      .from('partner_resources')
      .delete()
      .eq('id', resource_id);

    if (error) {
      console.error('Error deleting resource:', error);
      return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}