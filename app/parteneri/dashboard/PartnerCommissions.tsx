'use client';

import { useEffect, useState } from 'react';

export default function PartnerCommissions() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/partners/commissions');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Load failed');
        setData(json);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="rounded-2xl border border-neutral-200 bg-white p-6">Se încarcă...</div>;
  if (!data) return <div className="rounded-2xl border border-neutral-200 bg-white p-6">Nu sunt date</div>;

  const currency = (v: number) => new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(v || 0);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h3 className="font-semibold text-lg text-neutral-900 mb-4">Situație comisioane</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-neutral-500 text-sm">Vânzări completate</div>
          <div className="text-neutral-900 font-semibold">{currency(data.completed)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-neutral-500 text-sm">Vânzări în așteptare</div>
          <div className="text-neutral-900 font-semibold">{currency(data.pending)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4">
          <div className="text-neutral-500 text-sm">Comision acumulat (5%)</div>
          <div className="text-neutral-900 font-semibold">{currency(data.commission_completed)}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="px-4 py-3">Lună</th>
              <th className="px-4 py-3">Total net</th>
              <th className="px-4 py-3">Comision 5%</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.by_month || {}).map(([month, v]: any) => (
              <tr key={month} className="border-t border-neutral-200">
                <td className="px-4 py-3">{month}</td>
                <td className="px-4 py-3">{currency(v.total_net)}</td>
                <td className="px-4 py-3">{currency(v.commission)}</td>
              </tr>
            ))}
            {Object.keys(data.by_month || {}).length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-500">Nu există vânzări înregistrate</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}