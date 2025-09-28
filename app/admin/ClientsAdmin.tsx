'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Client = { id: number; email?: string|null; name?: string|null; company?: string|null; partner_email: string; created_at: string };

type Order = { id: number; client_id: number; partner_email: string; total_net: number; total_vat: number; total_gross: number; status: string; note?: string|null; created_at: string };

export default function ClientsAdmin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', company: '' });
  const [orderForm, setOrderForm] = useState({ client_id: 0, total_net: '', total_vat: '0', total_gross: '', status: 'completed', note: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [c, o] = await Promise.all([
        fetch('/api/admin/clients/list').then(r=>r.json()),
        fetch('/api/admin/orders/list').then(r=>r.json())
      ]);
      if (c.error) throw new Error(c.error);
      if (o.error) throw new Error(o.error);
      setClients(c.clients || []);
      setOrders(o.orders || []);
    } catch (e:any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const addClient = async () => {
    try {
      const res = await fetch('/api/admin/clients/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      toast.success('Client creat');
      setForm({ email:'', name:'', company:'' });
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  const addOrder = async () => {
    try {
      const payload = { ...orderForm, client_id: Number(orderForm.client_id), total_net: Number(orderForm.total_net || 0), total_vat: Number(orderForm.total_vat || 0), total_gross: Number(orderForm.total_gross || 0) };
      const res = await fetch('/api/admin/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      toast.success('Comandă adăugată');
      setOrderForm({ client_id: 0, total_net: '', total_vat: '0', total_gross: '', status: 'completed', note: '' });
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  const sumNet = orders.reduce((a,b)=> a + (b.status==='completed'? b.total_net : 0), 0);
  const commission = sumNet * 0.05;

  return (
    <div className="rounded-2xl border-2 border-gray-400 bg-white shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900">Clienți & Comenzi Manuale</h2>
      <p className="text-sm font-medium text-gray-700 mt-1">Asociază clienți cu parteneri pentru urmărirea comisioanelor</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Adaugă Client Nou</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
              <input 
                placeholder="client@companie.ro" 
                value={form.email} 
                onChange={e=>setForm({...form, email:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Nume Client</label>
              <input 
                placeholder="Ion Popescu" 
                value={form.name} 
                onChange={e=>setForm({...form, name:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Companie</label>
              <input 
                placeholder="Design Studio SRL" 
                value={form.company} 
                onChange={e=>setForm({...form, company:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
            <button 
              onClick={addClient} 
              className="w-full rounded-full bg-green-600 text-white px-6 py-2 text-sm font-bold hover:bg-green-700 shadow-md"
              disabled={loading}
            >
              {loading ? 'Se creează...' : '✅ Creează Client'}
            </button>
          </div>

          <div className="mt-8">
            <h4 className="text-lg font-bold text-gray-900 mb-3">👥 Clienți Existenți</h4>
            <div className="max-h-64 overflow-auto border-2 border-gray-300 rounded-lg">
              {clients.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-700 font-bold">Nu există clienți înregistrați</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {clients.map(c => (
                    <div key={c.id} className="border-b border-gray-200 p-3 hover:bg-gray-50">
                      <div className="text-sm font-bold text-gray-900">{c.name || c.email || 'Client fără nume'}</div>
                      <div className="text-xs font-semibold text-gray-700">{c.company} • Partener: {c.partner_email}</div>
                      <div className="text-xs font-medium text-gray-600">{c.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">🛒 Adaugă Comandă Manuală</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Selectează Client</label>
              <select 
                value={orderForm.client_id} 
                onChange={(e)=>setOrderForm({...orderForm, client_id: Number(e.target.value)})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-bold focus:border-blue-500"
              >
                <option value={0}>Selectează client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.email} - {c.company}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Total Net (RON)</label>
              <input 
                placeholder="5000.00" 
                value={orderForm.total_net} 
                onChange={e=>setOrderForm({...orderForm, total_net:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">TVA (RON)</label>
              <input 
                placeholder="950.00" 
                value={orderForm.total_vat} 
                onChange={e=>setOrderForm({...orderForm, total_vat:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Total Brut (RON)</label>
              <input 
                placeholder="5950.00" 
                value={orderForm.total_gross} 
                onChange={e=>setOrderForm({...orderForm, total_gross:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Status</label>
              <select 
                value={orderForm.status} 
                onChange={(e)=>setOrderForm({...orderForm, status:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-bold focus:border-blue-500"
              >
                <option value="completed">✅ Completată</option>
                <option value="pending">⏳ În așteptare</option>
                <option value="refunded">↩️ Refund</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Notă (opțional)</label>
              <input 
                placeholder="Detalii despre comandă..." 
                value={orderForm.note||''} 
                onChange={e=>setOrderForm({...orderForm, note:e.target.value})} 
                className="w-full rounded-xl border-2 border-gray-400 px-4 py-2 text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
              />
            </div>
            <button 
              onClick={addOrder} 
              className="w-full rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-bold hover:bg-blue-700 shadow-md"
              disabled={loading}
            >
              {loading ? 'Se salvează...' : '💾 Salvează Comandă'}
            </button>
          </div>

          <div className="mt-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <h4 className="text-sm font-bold text-green-900 mb-2">💰 Sumar Comisioane</h4>
            <div className="space-y-1 text-sm">
              <div className="font-bold text-green-800">
                Total Net (completed): <span className="text-green-900">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(sumNet)}</span>
              </div>
              <div className="font-bold text-green-800">
                Comision 5%: <span className="text-green-900">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(commission)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Istoric Comenzi</h3>
        <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Client</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Partener</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Total Net</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Total Brut</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border-b-2 border-gray-300">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {orders.map((o, index) => (
                <tr key={o.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-300`}>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {clients.find(c=>c.id===o.client_id)?.name || clients.find(c=>c.id===o.client_id)?.email || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{o.partner_email}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-700">
                    {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(o.total_net)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-700">
                    {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(o.total_gross)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      o.status === 'completed' ? 'bg-green-100 text-green-800' :
                      o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {new Date(o.created_at).toLocaleDateString('ro-RO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-700 font-bold">Nu există comenzi înregistrate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}