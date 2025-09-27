import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verifică dacă utilizatorul este partener activ
  const { data: appUser } = await supabase
    .from('users')
    .select('role, partner_status')
    .eq('email', user.email)
    .maybeSingle();

  if (!appUser || appUser.role !== 'partner' || appUser.partner_status !== 'active') {
    return NextResponse.json({ error: 'Access denied - partner status required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { items, partner_notes, status = 'draft' } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 });
    }

    // Creează comanda
    const { data: order, error: orderError } = await supabase
      .from('partner_orders')
      .insert({
        partner_email: user.email,
        status,
        partner_notes,
        submitted_at: status === 'submitted' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Adaugă items-urile
    const orderItems = items.map((item: any, index: number) => ({
      order_id: order.id,
      row_number: item.rowNumber || index + 1,
      manufacturer_name: item.manufacturerName,
      product_code: item.productCode,
      quantity: item.quantity,
      finish_code: item.finishCode || null,
      partner_price: item.partnerPrice || null
    }));

    const { error: itemsError } = await supabase
      .from('partner_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      id: order.id,
      order_number: order.order_number,
      status: order.status
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verifică dacă este admin sau partener
    const { data: appUser } = await supabase
      .from('users')
      .select('role, partner_status')
      .eq('email', user.email)
      .maybeSingle();

    let query = supabase
      .from('partner_orders')
      .select(`
        *,
        partner_order_items(*)
      `)
      .order('created_at', { ascending: false });

    // Partenerii văd doar comenzile lor
    if (appUser?.role === 'partner') {
      query = query.eq('partner_email', user.email);
    }
    // Adminii văd toate comenzile (implicit nu se adaugă filtru)

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json(orders || []);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' }, 
      { status: 500 }
    );
  }
}