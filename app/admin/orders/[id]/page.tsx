import { getServerSupabase } from '../../../auth/server';
import { redirect } from 'next/navigation';

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login');
  const { data: me } = await supabase.from('users').select('role').eq('email', user.email).maybeSingle();
  if (me?.role !== 'admin') redirect('/');

  const { data: order, error } = await supabase
    .from('partner_orders')
    .select('*, partner_order_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) return <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 text-red-600">{error.message}</div>;
  if (!order) return <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">Comanda nu există.</div>;

  async function updateStatus(formData: FormData) {
    'use server';
    const newStatus = formData.get('status') as string;
    const admin_notes = formData.get('admin_notes') as string;
    await fetch(process.env.NEXT_PUBLIC_URL + '/api/admin/partner-orders/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: id, status: newStatus, admin_notes }) });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Comandă #{order.order_number || order.id}</h1>
          <div className="text-sm text-neutral-600 mt-1">Creată: {new Date(order.created_at).toLocaleString('ro-RO')} • Partener: {order.partner_email}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white">
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
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <form action={updateStatus} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select name="status" defaultValue={order.status} className="w-full border border-neutral-300 rounded px-3 py-2">
                  {['draft','submitted','under_review','approved','confirmed_signed','proforma_generated','paid','in_production','shipped','delivered','cancelled'].map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Note Admin</label>
                <textarea name="admin_notes" defaultValue={order.admin_notes || ''} rows={5} className="w-full border border-neutral-300 rounded px-3 py-2" />
              </div>
              <button className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-bold hover:bg-neutral-800">Salvează</button>
            </form>
          </div>

          <UploadBlock id={id} label="Încarcă Proformă" patchKey="proforma_url" statusOnUpload="proforma_generated" currentUrl={order.proforma_url} />
          <PreviewBlock title="Previzualizare Proformă" url={order.proforma_url} />
          {order.confirmation_document_url && <PreviewBlock title="Confirmare semnată" url={order.confirmation_document_url} />}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';

function UploadBlock({ id, label, patchKey, statusOnUpload, currentUrl }: { id: string; label: string; patchKey: string; statusOnUpload?: string; currentUrl?: string|null }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const upJson = await up.json();
      if (!up.ok) throw new Error(upJson.error || 'Upload error');

      const body: any = { order_id: id };
      body[patchKey] = upJson.url;
      if (statusOnUpload) body.status = statusOnUpload;

      const res = await fetch('/api/admin/partner-orders/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');
      window.location.reload();
    } catch (e:any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="font-medium mb-2">{label}</div>
      {currentUrl && <div className="text-sm mb-2">Fișier existent: <a href={currentUrl} target="_blank" className="underline">Descarcă</a></div>}
      <div className="flex items-center gap-3">
        <input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} disabled={!file || loading} className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-bold hover:bg-neutral-800 disabled:opacity-50">{loading ? 'Se încarcă...' : 'Încarcă PDF'}</button>
      </div>
    </div>
  );
}

function PreviewBlock({ title, url }: { title: string; url?: string|null }) {
  if (!url) return null;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="p-3 border-b font-medium">{title}</div>
      <div className="h-96">
        <iframe src={url} className="w-full h-full" title={title} />
      </div>
    </div>
  );
}