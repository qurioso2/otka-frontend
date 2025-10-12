import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    
    // Simple stats count
    const { count: total } = await supabase.from('proforme').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('proforme').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: paid } = await supabase.from('proforme').select('*', { count: 'exact', head: true }).eq('status', 'paid');
    
    const stats = {
      total: total || 0,
      draft: pending || 0,
      sent: 0,
      paid: paid || 0
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
