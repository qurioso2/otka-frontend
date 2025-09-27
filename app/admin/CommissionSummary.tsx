'use client';
import { useEffect, useState } from 'react';

export default function CommissionSummary() {
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });
  const [data, setData] = useState<Record<string, { total_net: number; commission: number; orders: number }>>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/commission-summary?month=${month}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Load failed');
      setData(json.summary || {});
    } catch (e:any) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const rows = Object.entries(data);
  const totalNet = rows.reduce((a,[,v])=>a+v.total_net,0);
  const totalCom = rows.reduce((a,[,v])=>a+v.commission,0);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-neutral-900">Comisioane lunare</h2>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={(e)=>setMonth(e.target.value)} className="rounded-xl border border-neutral-300 px-3 py-2" />
          <button onClick={load} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800" disabled={loading}>
            {loading ? 'Se încarcă...' : 'Verifică'}
          </button>
          <button 
            onClick={() => window.open(`/api/admin/commission-summary/export?month=${month}`, '_blank')}
            className="rounded-full border border-neutral-300 text-neutral-700 px-4 py-2 text-sm hover:bg-neutral-50"
            disabled={rows.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-neutral-50">
              <th className="px-3 py-2">Partener (email)</th>
              <th className="px-3 py-2">Comenzi</th>
              <th className="px-3 py-2">Total Net</th>
              <th className="px-3 py-2">Comision 5%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([email, v]) => (
              <tr key={email} className="border-t border-neutral-200">
                <td className="px-3 py-2">{email}</td>
                <td className="px-3 py-2">{v.orders}</td>
                <td className="px-3 py-2">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(v.total_net)}</td>
                <td className="px-3 py-2">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(v.commission)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td className="px-3 py-2 font-medium">Total</td>
              <td className="px-3 py-2" />
              <td className="px-3 py-2 font-medium">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(totalNet)}</td>
              <td className="px-3 py-2 font-medium">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(totalCom)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
