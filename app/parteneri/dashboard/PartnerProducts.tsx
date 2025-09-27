'use client';

import { useMemo, useState } from 'react';

type Product = {
  id: number;
  name: string;
  sku: string;
  price_public_ttc: number;
  price_partner_net: number | null;
  stock_qty: number;
  gallery: string[] | null;
};

export default function PartnerProducts({ initialProducts }: { initialProducts: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return initialProducts.filter(p =>
      p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)
    );
  }, [search, initialProducts]);

  const downloadCSV = () => {
    const header = ["id","sku","name","price_public_ttc","price_partner_net","stock_qty"]; 
    const rows = filtered.map(p => [p.id, p.sku, p.name, p.price_public_ttc, p.price_partner_net ?? '', p.stock_qty]);
    const csv = [header.join(','), ...rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g,'""')}"` : v).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'otka-products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="p-4 flex items-center justify-between gap-3 border-b border-neutral-200">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută după nume sau SKU..."
          className="w-full max-w-sm rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <button onClick={downloadCSV} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800 transition">Descarcă CSV</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-neutral-50">
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Produs</th>
              <th className="px-4 py-3">Stoc</th>
              <th className="px-4 py-3">Preț public</th>
              <th className="px-4 py-3">Preț partener</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-neutral-200">
                <td className="px-4 py-3 font-mono text-xs text-neutral-600">{p.sku}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.gallery?.[0] || '/vercel.svg'} alt={p.name} className="h-10 w-14 rounded object-cover bg-neutral-100" />
                    <div className="text-neutral-900">{p.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3">{p.stock_qty}</td>
                <td className="px-4 py-3">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}</td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{p.price_partner_net != null ? new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_partner_net) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
