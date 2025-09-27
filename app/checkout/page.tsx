'use client';
import { useState } from 'react';
import { useCart } from '../ui/cart/CartProvider';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ number?: string; url?: string } | null>(null);

  const handleSubmit = async (formData: FormData): Promise<void> => {
    if (items.length === 0) { toast.error('Coșul este gol'); return; }
    setLoading(true);
    try {
      const body = {
        clientName: String(formData.get('name') || ''),
        clientCIF: String(formData.get('cif') || ''),
        address: String(formData.get('address') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        products: items.map(i => ({ name: i.name, sku: i.sku, quantity: i.qty, price: i.price })),
      };
      const res = await fetch('/api/smartbill/proforma', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare generare proformă');
      setResult({ number: data.number, url: data.url });
      toast.success('Proformă generată');
      clear();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Eroare';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await handleSubmit(fd);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>

      {items.length === 0 && !result && (
        <p className="mt-4 text-neutral-600">Coșul este gol.</p>
      )}

      {!result && (
        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-neutral-700">Nume client</label>
            <input name="name" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-700">Email</label>
              <input name="email" type="email" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-700">Telefon</label>
              <input name="phone" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-700">Adresă</label>
            <input name="address" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm text-neutral-700">CIF (opțional)</label>
            <input name="cif" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>Total</div>
              <div className="text-lg font-semibold">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(total)}</div>
            </div>
          </div>

          <button disabled={loading || items.length === 0} className="rounded-full bg-black text-white px-5 py-2.5 text-sm hover:bg-neutral-800 disabled:opacity-50">{loading ? 'Se procesează...' : 'Generează proformă'}</button>
        </form>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="font-medium text-emerald-900">Proforma a fost generată cu succes.</div>
          <div className="text-sm mt-1 text-emerald-800">Număr: {result.number || '-'}</div>
          {result.url && <a href={result.url} target="_blank" className="text-sm underline">Descarcă proforma</a>}
        </div>
      )}
    </div>
  );
}
