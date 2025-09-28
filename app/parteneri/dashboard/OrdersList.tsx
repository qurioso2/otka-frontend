'use client';

import { useEffect, useState } from 'react';

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/partners/orders');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Load failed');
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="p-6 border-b border-neutral-200">
        <h3 className="font-semibold text-lg text-neutral-900">Comenzile Mele</h3>
        <p className="text-sm text-neutral-600 mt-1">Status, valori și date</p>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="px-4 py-3">Nr. Comandă</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Produse</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">Se încarcă...</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-neutral-200">
                  <td className="px-4 py-3 font-medium text-neutral-900">{o.order_number || o.id}</td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString('ro-RO')}</td>
                  <td className="px-4 py-3">{Array.isArray(o.partner_order_items) ? o.partner_order_items.length : 0}</td>
                </tr>
              ))
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">Nu există comenzi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}