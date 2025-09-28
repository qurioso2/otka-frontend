import { getServerSupabase } from '../../../auth/server';
import { redirect } from 'next/navigation';
import ClientEditor from './ClientEditor';

export default async function EditDraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login');

  const { data: order, error } = await supabase
    .from('partner_orders')
    .select('*, partner_order_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 text-red-600">{error.message}</div>;
  if (!order) return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">Comanda nu a fost găsită.</div>;
  if (order.partner_email !== user.email || order.status !== 'draft') redirect(`/parteneri/orders/${id}`);

  const items = (order.partner_order_items || []).map((it: any) => ({
    rowNumber: it.row_number,
    manufacturerName: it.manufacturer_name,
    productCode: it.product_code,
    quantity: it.quantity,
    finishCode: it.finish_code,
    partnerPrice: it.partner_price,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold mb-4">Editează Draft #{order.order_number || order.id}</h1>
      <ClientEditor id={id} initialItems={items} initialNotes={order.partner_notes || ''} />
    </div>
  );
}