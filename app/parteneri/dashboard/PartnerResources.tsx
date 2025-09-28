'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface PartnerResource {
  id: string;
  name: string; // format: "Producător - Titlu"
  description: string;
  file_type: 'price_list'|'catalog'|'images'|'materials'|string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

type Row = {
  manufacturer: string;
  price_list?: string;
  catalog?: string;
  images?: string;
  materials?: string;
};

export default function PartnerResources() {
  const [resources, setResources] = useState<PartnerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [manufacturerFilter, setManufacturerFilter] = useState<string>('');

  useEffect(() => { loadResources(); }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners/resources');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResources(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Eroare la încărcare';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const rows: Row[] = useMemo(() => {
    const map = new Map<string, Row>();
    for (const r of resources) {
      const manufacturer = r.name?.split(' - ')[0] || r.name || '—';
      const row = map.get(manufacturer) || { manufacturer };
      if (r.file_type === 'price_list') row.price_list = r.file_url;
      else if (r.file_type === 'catalog') row.catalog = r.file_url;
      else if (r.file_type === 'images') row.images = r.file_url;
      else if (r.file_type === 'materials') row.materials = r.file_url;
      map.set(manufacturer, row);
    }
    let arr = Array.from(map.values()).sort((a,b)=>a.manufacturer.localeCompare(b.manufacturer));
    if (manufacturerFilter) arr = arr.filter(r => r.manufacturer === manufacturerFilter);
    return arr;
  }, [resources, manufacturerFilter]);

  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    resources.forEach(r => set.add(r.name?.split(' - ')[0] || r.name || '—'));
    return Array.from(set).sort((a,b)=>a.localeCompare(b));
  }, [resources]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="h-4 w-1/3 bg-neutral-100 rounded mb-2"></div>
            <div className="h-3 w-2/3 bg-neutral-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-neutral-900">Resurse Parteneri</h3>
            <p className="text-sm text-neutral-600 mt-1">Producători, liste de preț, cataloage și materiale (din R2)</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={manufacturerFilter} onChange={(e)=>setManufacturerFilter(e.target.value)} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm">
              <option value="">Toți producătorii</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={()=>{ setManufacturerFilter(''); }} className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">Reset</button>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="px-4 py-3">Producător</th>
              <th className="px-4 py-3">Listă de preț</th>
              <th className="px-4 py-3">Catalog</th>
              <th className="px-4 py-3">Materiale</th>
              <th className="px-4 py-3">Imagini</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.manufacturer} className="border-t border-neutral-200">
                <td className="px-4 py-3 font-medium text-neutral-900">{r.manufacturer}</td>
                <td className="px-4 py-3">{r.price_list ? <a className="underline text-blue-700" target="_blank" href={r.price_list}>Descarcă</a> : <span className="text-neutral-400">—</span>}</td>
                <td className="px-4 py-3">{r.catalog ? <a className="underline text-blue-700" target="_blank" href={r.catalog}>Descarcă</a> : <span className="text-neutral-400">—</span>}</td>
                <td className="px-4 py-3">{r.materials ? <a className="underline text-blue-700" target="_blank" href={r.materials}>Descarcă</a> : <span className="text-neutral-400">—</span>}</td>
                <td className="px-4 py-3">{r.images ? <a className="underline text-blue-700" target="_blank" href={r.images}>Descarcă</a> : <span className="text-neutral-400">—</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Nu sunt resurse disponibile</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}