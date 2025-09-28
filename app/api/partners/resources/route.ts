import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Partener sau admin pot vedea resursele marcate pentru parteneri și vizibile
  const { data, error } = await supabase
    .from('partner_resources')
    .select('*')
    .eq('partner_access', true)
    .eq('visible', true)
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}