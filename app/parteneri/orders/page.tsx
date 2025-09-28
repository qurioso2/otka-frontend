import { getServerSupabase } from "../../auth/server";
import { getCurrentAppUser } from "../../../lib/userProfile";
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  submitted_at?: string;
  approved_at?: string;
  paid_at?: string;
  delivered_at?: string;
  delivery_estimated_date?: string;
  total_gross?: number;
  partner_notes?: string;
  partner_order_items: Array<{
    id: string;
    manufacturer_name: string;
    product_code: string;
    quantity: number;
    finish_code?: string;
    partner_price?: number;
  }>;
}

const statusLabels: Record<string, string> = {
  'draft': 'Draft',
  'submitted': 'Trimis pentru Verificare',
  'under_review': 'În Verificare',
  'approved': 'Aprobat',
  'confirmed_signed': 'Confirmare Semnată',
  'proforma_generated': 'Proformă Generată',
  'paid': 'Achitat',
  'in_production': 'În Producție',
  'shipped': 'Expediat',
  'delivered': 'Livrat',
  'cancelled': 'Anulat'
};

const statusColors: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-800',
  'submitted': 'bg-blue-100 text-blue-800',
  'under_review': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'confirmed_signed': 'bg-green-100 text-green-800',
  'proforma_generated': 'bg-purple-100 text-purple-800',
  'paid': 'bg-green-100 text-green-800',
  'in_production': 'bg-blue-100 text-blue-800',
  'shipped': 'bg-indigo-100 text-indigo-800',
  'delivered': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

export default async function PartnerOrders() {
  const supabase = await getServerSupabase();
  const appUser = await getCurrentAppUser();

  if (!appUser || (appUser.role !== 'partner' && appUser.role !== 'admin')) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Acces Neautorizat</h1>
          <p className="mt-2 text-neutral-600">Nu aveți permisiuni pentru a accesa această pagină.</p>
        </div>
      </div>
    );
  }

  // Fetch orders
  let query = supabase
    .from('partner_orders')
    .select(`
      *,
      partner_order_items(*)
    `)
    .order('created_at', { ascending: false });

  if (appUser.role === 'partner') {
    query = query.eq('partner_email', appUser.email);
  }

  const { data: orders, error } = await query;
  const rows: Order[] = (orders as Order[] | null) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Comenzile Mele</h1>
          <p className="text-neutral-600">Urmăriți statusul comenzilor dvs.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/parteneri/dashboard"
            className="bg-neutral-600 text-white px-4 py-2 rounded-full hover:bg-neutral-700 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/parteneri/dashboard#comandă-nouă"
            className="bg-black text-white px-4 py-2 rounded-full hover:bg-neutral-800 transition"
          >
            Comandă Nouă
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800">Eroare la încărcarea comenzilor: {error.message}</p>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Nu aveți comenzi încă</h3>
          <p className="text-neutral-600 mb-6">Începeți prima comandă pentru a primi o ofertă personalizată</p>
          <Link
            href="/parteneri/dashboard#comandă-nouă"
            className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full hover:bg-neutral-800 transition"
          >
            Creați Prima Comandă
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map((order) => (
            <div key={order.id} className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900">
                        {order.order_number}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Creat pe {new Date(order.created_at).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-600">
                      {order.partner_order_items.length} produse
                    </div>
                    {order.total_gross && (
                      <div className="font-semibold text-lg">
                        {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(order.total_gross)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {order.submitted_at && (
                    <div className="text-sm">
                      <div className="text-neutral-600">Trimis pentru verificare</div>
                      <div className="font-medium">{new Date(order.submitted_at).toLocaleDateString('ro-RO')}</div>
                    </div>
                  )}
                  {order.approved_at && (
                    <div className="text-sm">
                      <div className="text-neutral-600">Aprobat</div>
                      <div className="font-medium">{new Date(order.approved_at).toLocaleDateString('ro-RO')}</div>
                    </div>
                  )}
                  {order.paid_at && (
                    <div className="text-sm">
                      <div className="text-neutral-600">Achitat</div>
                      <div className="font-medium">{new Date(order.paid_at).toLocaleDateString('ro-RO')}</div>
                    </div>
                  )}
                  {order.delivery_estimated_date && (
                    <div className="text-sm">
                      <div className="text-neutral-600">Livrare estimată</div>
                      <div className="font-medium">{new Date(order.delivery_estimated_date).toLocaleDateString('ro-RO')}</div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-neutral-900 mb-3">Produse Comandate</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-2">Producător</th>
                          <th className="text-left py-2">Cod Produs</th>
                          <th className="text-left py-2">Cantitate</th>
                          <th className="text-left py-2">Finisaj</th>
                          <th className="text-left py-2">Preț Est.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.partner_order_items.map((item) => (
                          <tr key={item.id} className="border-b border-neutral-100">
                            <td className="py-2">{item.manufacturer_name}</td>
                            <td className="py-2 font-mono">{item.product_code}</td>
                            <td className="py-2">{item.quantity}</td>
                            <td className="py-2">{item.finish_code || '-'}</td>
                            <td className="py-2">
                              {item.partner_price 
                                ? new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(item.partner_price)
                                : '-'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {order.partner_notes && (
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <h5 className="font-medium text-neutral-900 mb-2">Observații</h5>
                    <p className="text-sm text-neutral-700">{order.partner_notes}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/parteneri/orders/${order.id}`}
                    className="text-sm bg-neutral-100 text-neutral-700 px-4 py-2 rounded-full hover:bg-neutral-200 transition"
                  >
                    Vezi Detalii
                  </Link>
                  {order.status === 'draft' && (
                    <Link
                      href={`/parteneri/orders/${order.id}/edit`}
                      className="text-sm border border-neutral-300 text-neutral-700 px-4 py-2 rounded-full hover:bg-neutral-50 transition"
                    >
                      Editează
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}