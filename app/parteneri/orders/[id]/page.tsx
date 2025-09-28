import { getServerSupabase } from "../../auth/server";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    confirmed_signed: 'bg-green-100 text-green-800',
    proforma_generated: 'bg-purple-100 text-purple-800',
    paid: 'bg-green-100 text-green-800',
    in_production: 'bg-orange-100 text-orange-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  const cls = map[status] || 'bg-neutral-100 text-neutral-800';
  return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${cls}`}>{status}</span>;
}

export default async function PartnerOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">Trebuie să te autentifici.</div>;
  }

  // Partenerul vede doar comanda lui (RLS aplică)
  const { data: order, error } = await supabase
    .from('partner_orders')
    .select('*, partner_order_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 text-red-600">{error.message}</div>;
  }
  if (!order) {
    return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">Comanda nu a fost găsită.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Comandă #{order.order_number || order.id}</h1>
          <div className="mt-1 text-sm text-neutral-600">Creată la {new Date(order.created_at).toLocaleString('ro-RO')}</div>
        </div>
        <div className="flex items-center gap-2"><StatusBadge status={order.status} /></div>
      </div>

      {/* Timeline simplu */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h3 className="font-medium text-neutral-900 mb-3">Status timeline</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          {['draft','submitted','under_review','approved','confirmed_signed','proforma_generated','paid','in_production','shipped','delivered'].map(step => (
            <span key={step} className={`px-3 py-1 rounded-full border ${order.status === step ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-700'}`}>{step}</span>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <div className="p-4 border-b border-neutral-200 font-medium">Produse</div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50">
              <tr className="text-left">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Producător</th>
                <th className="px-4 py-2">Cod</th>
                <th className="px-4 py-2">Cant</th>
                <th className="px-4 py-2">Finisaj</th>
                <th className="px-4 py-2">Preț partener</th>
              </tr>
            </thead>
            <tbody>
              {(order.partner_order_items || []).map((it: any) => (
                <tr key={it.id} className="border-t border-neutral-200">
                  <td className="px-4 py-2">{it.row_number}</td>
                  <td className="px-4 py-2">{it.manufacturer_name}</td>
                  <td className="px-4 py-2">{it.product_code}</td>
                  <td className="px-4 py-2">{it.quantity}</td>
                  <td className="px-4 py-2">{it.finish_code || '-'}</td>
                  <td className="px-4 py-2">{it.partner_price ? new Intl.NumberFormat('ro-RO',{style:'currency',currency:'RON'}).format(it.partner_price) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmare semnată */}
      <UploadConfirmation orderId={order.id} currentUrl={order.confirmation_document_url} />

      <div className="pt-4"><Link href="/parteneri/dashboard" className="underline">Înapoi la Dashboard</Link></div>
    </div>
  );
}

function UploadConfirmation({ orderId, currentUrl }: { orderId: string; currentUrl?: string | null }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="font-medium text-neutral-900 mb-2">Confirmare semnată</h3>
      {currentUrl ? (
        <div className="mb-3 text-sm">Fișier existent: <a href={currentUrl} target="_blank" className="underline">Descarcă</a></div>
      ) : (
        <p className="text-sm text-neutral-600 mb-3">Încarcă confirmarea semnată (PDF)</p>
      )}
      <UploadForm orderId={orderId} />
    </div>
  );
}

'use client';
import { useState as useClientState } from 'react';

function UploadForm({ orderId }: { orderId: string }) {
  const [file, setFile] = useClientState<File | null>(null);
  const [loading, setLoading] = useClientState(false);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const upJson = await up.json();
      if (!up.ok) throw new Error(upJson.error || 'Upload error');

      const res = await fetch('/api/partners/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, patch: { confirmation_document_url: upJson.url, status: 'confirmed_signed' } })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Eroare');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-3">
      <input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
      <button onClick={upload} disabled={!file || loading} className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-bold hover:bg-neutral-800 disabled:opacity-50">{loading ? 'Se încarcă...' : 'Încarcă PDF'}</button>
    </div>
  );
}