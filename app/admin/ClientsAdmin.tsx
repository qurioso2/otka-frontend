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
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h2 className="font-medium text-neutral-900">Clienți & Comenzi</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-neutral-900 font-medium">Adaugă client</h3>
          <div className="mt-2 flex flex-col gap-2">
            <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2" />
            <input placeholder="Nume" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2" />
            <input placeholder="Companie" value={form.company} onChange={e=>setForm({...form, company:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2" />
            <button onClick={addClient} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">Creează client</button>
          </div>

          <h3 className="mt-6 text-neutral-900 font-medium">Clienți existenți</h3>
          <ul className="mt-2 space-y-2 max-h-64 overflow-auto">
            {clients.map(c => (
              <li key={c.id} className="rounded-xl border border-neutral-200 p-2">
                <div className="font-medium">{c.name || c.email || 'Client fără nume'}</div>
                <div className="text-xs text-neutral-600">{c.company} · {c.email}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-neutral-900 font-medium">Adaugă comandă manuală</h3>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <select value={orderForm.client_id} onChange={(e)=>setOrderForm({...orderForm, client_id: Number(e.target.value)})} className="rounded-xl border border-neutral-300 px-3 py-2">
              <option value={0}>Selectează client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
            </select>
            <input placeholder="Total net (RON)" value={orderForm.total_net} onChange={e=>setOrderForm({...orderForm, total_net:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2" />
            <input placeholder="TVA (RON)" value={orderForm.total_vat} onChange={e=>setOrderForm({...orderForm, total_vat:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2" />
            <input placeholder="Total brut (RON)" value={orderForm.total_gross} onChange={e=>setOrderForm({...orderForm, total_gross:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2" />
            <select value={orderForm.status} onChange={(e)=>setOrderForm({...orderForm, status:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2">
              <option value="completed">completed</option>
              <option value="pending">pending</option>
              <option value="refunded">refunded</option>
            </select>
            <input placeholder="Notă (opțional)" value={orderForm.note||''} onChange={e=>setOrderForm({...orderForm, note:e.target.value})} className="rounded-xl border border-neutral-300 px-3 py-2" />
            <button onClick={addOrder} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">Salvează comandă</button>
          </div>

          <div className="mt-6 text-sm text-neutral-700">
            <div>Total net comenzi (completed): <strong>{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(sumNet)}</strong></div>
            <div>Comision 5%: <strong>{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(commission)}</strong></div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-neutral-900 font-medium">Istoric comenzi</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-neutral-50">
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Total net</th>
                <th className="px-3 py-2">Total brut</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-neutral-200">
                  <td className="px-3 py-2">{clients.find(c=>c.id===o.client_id)?.name || clients.find(c=>c.id===o.client_id)?.email || '-'}</td>
                  <td className="px-3 py-2">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(o.total_net)}</td>
                  <td className="px-3 py-2">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(o.total_gross)}</td>
                  <td className="px-3 py-2">{o.status}</td>
                  <td className="px-3 py-2">{new Date(o.created_at).toLocaleDateString('ro-RO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
