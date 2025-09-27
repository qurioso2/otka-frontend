import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verifică dacă utilizatorul este partener sau admin
  const { data: appUser } = await supabase
    .from('users')
    .select('role, partner_status')
    .eq('email', user.email)
    .maybeSingle();

  if (!appUser || (appUser.role !== 'admin' && appUser.role !== 'partner')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const { data: resources, error } = await supabase
      .from('partner_resources')
      .select('*')
      .eq('visible', true)
      .eq('partner_access', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(resources || []);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' }, 
      { status: 500 }
    );
  }
}