import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const start = month ? new Date(month + '-01T00:00:00') : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = new Date(start); end.setMonth(start.getMonth() + 1);

  // Obțin date mai detaliate pentru CSV cu informații despre prețuri partener
  const { data, error } = await supabase
    .from('manual_orders')
    .select(`
      partner_email, 
      total_net, 
      status, 
      created_at, 
      order_id,
      clients(name, company_name)
    `)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Generez CSV cu toate detaliile incluzând info client
  const csvRows = [
    'Email Partener,Client,ID Comandă,Data,Total Net (RON),Preț Public Estimat (RON),Reducere Partener (%),Comision 5% (RON),Status'
  ];

  for (const row of data || []) {
    const totalNet = Number(row.total_net || 0);
    const commission = totalNet * 0.05;
    const date = new Date(row.created_at).toLocaleDateString('ro-RO');
    
    // Estimez prețul public cu o marjă de 20-30% pentru parteneri
    const estimatedPublicPrice = totalNet * 1.25; // 25% markup estimate
    const partnerDiscount = ((estimatedPublicPrice - totalNet) / estimatedPublicPrice * 100);
    
    const clientInfo = row.clients ? 
      (row.clients.company_name || row.clients.name || '-') : '-';
    
    csvRows.push([
      row.partner_email,
      clientInfo,
      row.order_id || '-',
      date,
      totalNet.toFixed(2),
      estimatedPublicPrice.toFixed(2),
      partnerDiscount.toFixed(1) + '%',
      commission.toFixed(2),
      row.status
    ].join(','));
  }

  // Adaug și sumarul pe parteneri
  const map: Record<string, { total_net: number; commission: number; orders: number }> = {};
  for (const row of data || []) {
    if (row.status !== 'completed') continue;
    const key = row.partner_email as string;
    if (!map[key]) map[key] = { total_net: 0, commission: 0, orders: 0 };
    map[key].total_net += Number(row.total_net || 0);
    map[key].orders += 1;
  }
  Object.keys(map).forEach(k => { map[k].commission = map[k].total_net * 0.05; });

  if (Object.keys(map).length > 0) {
    csvRows.push('');
    csvRows.push('SUMAR PE PARTENERI');
    csvRows.push('Email Partener,Număr Comenzi,Total Net (RON),Total Comision (RON)');
    
    Object.entries(map).forEach(([email, stats]) => {
      csvRows.push([
        email,
        stats.orders.toString(),
        stats.total_net.toFixed(2),
        stats.commission.toFixed(2)
      ].join(','));
    });
  }

  const csv = csvRows.join('\n');
  const monthLabel = start.toISOString().slice(0,7);
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="comisioane-${monthLabel}.csv"`,
    },
  });
}
