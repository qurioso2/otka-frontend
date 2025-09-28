'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DraftsList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/partners/orders');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Load failed');
        const drafts = (Array.isArray(data) ? data : []).filter((o) => o.status === 'draft');
        setOrders(drafts);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="p-6 border-b border-neutral-200">
        <h3 className="font-semibold text-lg text-neutral-900">Drafturile Mele</h3>
        <p className="text-sm text-neutral-600 mt-1">Comenzi ne-trimise încă</p>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="text-neutral-500">Se încarcă...</div>
        ) : orders.length === 0 ? (
          <div className="text-neutral-500">Nu aveți drafturi</div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
                <div>
                  <div className="font-medium text-neutral-900">Comanda #{o.order_number || o.id}</div>
                  <div className="text-sm text-neutral-600">Creată la {new Date(o.created_at).toLocaleString('ro-RO')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/parteneri/orders/${o.id}/edit`} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Editează</Link>
                  <Link href={`/parteneri/orders/${o.id}`} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Detalii</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}