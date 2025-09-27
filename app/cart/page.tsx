'use client';
import Link from 'next/link';
import { useCart } from '../ui/cart/CartProvider';

export default function CartPage() {
  const { items, total, update, remove, clear } = useCart();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Coș de cumpărături</h1>

      {items.length === 0 ? (
        <div className="mt-6 text-neutral-600">Coșul este gol. <Link href="/" className="underline">Continuă cumpărăturile</Link></div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((it) => (
              <div key={it.sku} className="rounded-2xl border border-neutral-200 bg-white p-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image || '/vercel.svg'} alt={it.name} className="h-16 w-20 rounded object-cover bg-neutral-100" />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">{it.name}</div>
                  <div className="text-sm text-neutral-600">{it.sku}</div>
                </div>
                <input type="number" min={1} value={it.qty} onChange={(e) => update(it.sku, Number(e.target.value))} className="w-16 rounded-xl border border-neutral-300 px-2 py-1" />
                <div className="w-28 text-right font-semibold">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(it.price * it.qty)}</div>
                <button onClick={() => remove(it.sku)} className="text-sm text-neutral-500 hover:text-neutral-800">Șterge</button>
              </div>
            ))}
            <button onClick={clear} className="text-sm text-neutral-500 hover:text-neutral-800">Golește coșul</button>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 h-fit">
            <div className="flex items-center justify-between">
              <div>Total</div>
              <div className="text-lg font-semibold">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(total)}</div>
            </div>
            <Link href="/checkout" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">Continuă la checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
