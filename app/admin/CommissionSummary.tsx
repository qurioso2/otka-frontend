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
    <div className="rounded-2xl border-2 border-gray-400 bg-white shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">💰 Comisioane Lunare</h2>
          <p className="text-sm font-medium text-gray-700 mt-1">Rapoarte detaliate pentru plata partenerilor</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">Luna</label>
            <input 
              type="month" 
              value={month} 
              onChange={(e)=>setMonth(e.target.value)} 
              className="rounded-xl border-2 border-gray-400 px-3 py-2 text-sm font-medium text-gray-900 focus:border-blue-500" 
            />
          </div>
          <button 
            onClick={load} 
            className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-bold hover:bg-blue-700 shadow-md" 
            disabled={loading}
          >
            {loading ? 'Se încarcă...' : '🔍 Verifică'}
          </button>
          <button 
            onClick={() => window.open(`/api/admin/commission-summary/export?month=${month}`, '_blank')}
            className="rounded-full border-2 border-green-400 bg-green-50 text-green-800 px-4 py-2 text-sm font-bold hover:bg-green-100"
            disabled={rows.length === 0}
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Partener (email)</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Nr. Comenzi</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Total Net</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Comision 5%</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map(([email, v], index) => (
              <tr key={email} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-300`}>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{email}</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-700">{v.orders}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-700">
                  {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(v.total_net)}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-purple-700">
                  {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(v.commission)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200">
            <tr className="border-t-2 border-gray-400">
              <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTAL GENERAL</td>
              <td className="px-4 py-3 text-sm font-bold text-blue-800">{rows.reduce((a,[,v])=>a+v.orders,0)}</td>
              <td className="px-4 py-3 text-sm font-bold text-green-800">
                {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(totalNet)}
              </td>
              <td className="px-4 py-3 text-sm font-bold text-purple-800">
                {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(totalCom)}
              </td>
            </tr>
          </tfoot>
        </table>
        
        {rows.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-600 text-4xl mb-2">💰</div>
            <p className="text-gray-800 font-bold">Nu există comisioane pentru luna selectată</p>
            <p className="text-gray-700 font-medium text-sm mt-1">Selectează o lună diferită sau verifică comenzile existente</p>
          </div>
        )}
      </div>
    </div>
  );
}
