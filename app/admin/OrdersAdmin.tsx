'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

import * as XLSX from 'xlsx';

type PartnerOrder = {
  id: string;
  order_number: string;
  partner_email: string;
  status: string;
  created_at: string;
  submitted_at?: string;
  total_gross: number;
  items_count: number;
  partner_notes?: string;
  admin_notes?: string;
};

const statusLabels = {
  'draft': '📝 Draft',
  'submitted': '📤 Trimisă',
  'under_review': '👀 În Verificare',
  'approved': '✅ Aprobată',
  'confirmed_signed': '📋 Confirmată',
  'proforma_generated': '🧾 Proformă',
  'paid': '💳 Plătită',
  'in_production': '🏭 În Producție',
  'shipped': '🚚 Expediată',
  'delivered': '✅ Livrată',
  'cancelled': '❌ Anulată'
};

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800',
  'submitted': 'bg-blue-100 text-blue-800',
  'under_review': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'confirmed_signed': 'bg-green-100 text-green-800',
  'proforma_generated': 'bg-purple-100 text-purple-800',
  'paid': 'bg-green-100 text-green-800',
  'in_production': 'bg-orange-100 text-orange-800',
  'shipped': 'bg-blue-100 text-blue-800',
  'delivered': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800'
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPartner, setFilterPartner] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/partner-orders/list');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data.orders || []);
      setSelected(new Set());
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string, adminNotes?: string) => {
    try {
      const res = await fetch('/api/admin/partner-orders/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, status: newStatus, admin_notes: adminNotes }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      toast.success(`Comandă actualizată la status: ${statusLabels[newStatus as keyof typeof statusLabels]}`);
      loadOrders();
    } catch (error: any) { toast.error(error.message); }
  };

  const inDateRange = (created_at: string) => {
    const d = new Date(created_at).getTime();
    const f = fromDate ? new Date(fromDate).getTime() : -Infinity;
    const t = toDate ? new Date(toDate).getTime() + 24*60*60*1000 : Infinity;
    return d >= f && d < t;
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const partnerMatch = filterPartner === 'all' || order.partner_email === filterPartner;
    const dateMatch = inDateRange(order.created_at);
    return statusMatch && partnerMatch && dateMatch;
  });

  const uniquePartners = [...new Set(orders.map(o => o.partner_email))];

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const bulkUpdate = async (status: string) => {
    if (selected.size === 0) return toast.error('Selectează cel puțin o comandă');
    try {
      await Promise.all(Array.from(selected).map(id => updateOrderStatus(id, status)));
      toast.success('Status actualizat în bloc');
      setSelected(new Set());
      loadOrders();
    } catch (e) {}
  };

  const exportXlsx = () => { window.open('/api/admin/partner-orders/export-xlsx', '_blank'); };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Comenzi Parteneri B2B</h3>
            <p className="text-sm text-gray-600">Gestionează comenzile create de parteneri prin formularul de comenzi</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{filteredOrders.length} comenzi</span>
            <button onClick={exportXlsx} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Export XLSX</button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrează după status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Toate statusurile</option>
              {Object.entries(statusLabels).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrează după partener</label>
            <select value={filterPartner} onChange={(e) => setFilterPartner(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Toți partenerii</option>
              {uniquePartners.map(email => (<option key={email} value={email}>{email}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">De la</label>
            <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Până la</label>
            <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3"><span className="sr-only">Select</span></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comandă</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partener</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valoare</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap align-top"><input type="checkbox" checked={selected.has(order.id)} onChange={()=>toggleSelect(order.id)} /></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900"><Link href={`/admin/orders/${order.id}`} className="underline">{order.order_number}</Link></div>
                      <div className="text-sm text-gray-500">{order.items_count} produse</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{order.partner_email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>{statusLabels[order.status as keyof typeof statusLabels] || order.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(order.total_gross || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('ro-RO')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2"><select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1">{Object.entries(statusLabels).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12"><div className="text-gray-400 text-4xl mb-2">📋</div><p className="text-gray-500">{orders.length === 0 ? 'Nu există comenzi de la parteneri' : 'Nu există comenzi pentru filtrele selectate'}</p></div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Despre Comenzile Parteneri</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-semibold mb-2">🔄 Workflow Comenzi B2B:</h5>
            <ol className="space-y-1">
              <li>1. Partenerul creează comandă (draft)</li>
              <li>2. Trimite pentru verificare (submitted)</li>
              <li>3. Admin verifică și aprobă</li>
              <li>4. Se generează proformă</li>
              <li>5. După plată → producție → livrare</li>
            </ol>
          </div>
          <div>
            <h5 className="font-semibold mb-2">📝 Diferența față de Comenzi Manuale:</h5>
            <ul className="space-y-1">
              <li>• Comenzi B2B = create prin formular de parteneri</li>
              <li>• Comenzi Manuale = înregistrate manual de admin</li>
              <li>• Ambele tipuri generează comisioane</li>
              <li>• Toate se văd în raportul de comisioane</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}