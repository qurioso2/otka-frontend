'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const TYPES = [
  { value: 'hero', label: 'Hero (landing)' },
  { value: 'og', label: 'OpenGraph (social share)' },
  { value: 'banner', label: 'Bannere tematice' },
];

export default function PublicAssetsAdmin() {
  const [assets, setAssets] = useState<any[]>([]);
  const [type, setType] = useState('hero');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    const res = await fetch('/api/admin/public-assets/list', { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok) return toast.error(json.error || 'Load failed');
    setAssets(json.assets || []);
  };

  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return assets.filter((a) => {
      const t = !filterType || a.type === filterType;
      const s = !term || (a.title || '').toLowerCase().includes(term) || (a.url || '').toLowerCase().includes(term);
      return t && s;
    }).sort((a,b)=> (a.type===b.type ? (a.sort_order - b.sort_order) : a.type.localeCompare(b.type)));
  }, [assets, filterType, search]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!file) throw new Error('Alegeți fișier');
      const fd = new FormData(); fd.append('file', file);
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const upJson = await up.json(); if (!up.ok) throw new Error(upJson.error || 'Upload failed');

      const res = await fetch('/api/admin/public-assets/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, url: upJson.url, active: true, sort_order: 0 })
      });
      const json = await res.json(); if (!res.ok) throw new Error(json.error || 'Create failed');
      toast.success('Imagine adăugată');
      setTitle(''); setFile(null); (document.getElementById('hero-file') as HTMLInputElement | null)?.value && ((document.getElementById('hero-file') as HTMLInputElement).value = '');
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  // Generate a minimalist SVG hero and upload
  const generateHero = async () => {
    const now = new Date().toISOString().slice(0,10);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#111827"/><stop offset="100%" stop-color="#374151"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial" font-size="64" fill="#ffffff" opacity="0.9">OTKA • Design interior</text><text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial" font-size="24" fill="#D1D5DB" opacity="0.9">${now}</text></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const f = new File([blob], `otka-hero-${now}.svg`, { type: 'image/svg+xml' });
    setFile(f);
    setTitle(`Hero ${now}`);
    setType('hero');
    toast.success('Imagine SVG generată — apăsați “Încarcă” pentru a salva');
  };

  const update = async (id: string, patch: any) => {
    const res = await fetch('/api/admin/public-assets/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
    const json = await res.json(); if (!res.ok) return toast.error(json.error || 'Update failed');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Ștergi această imagine?')) return;
    const res = await fetch('/api/admin/public-assets/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const json = await res.json(); if (!res.ok) return toast.error(json.error || 'Delete failed');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Imagini Publice (Hero/Bannere)</h3>
        <form onSubmit={upload} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tip</label>
            <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full border border-neutral-300 rounded px-3 py-2">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Titlu</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Amenajare living / Colectie toamna" className="w-full border border-neutral-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Fișier</label>
            <input id="hero-file" type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="w-full" accept="image/*" />
          </div>
          <div className="sm:col-span-3 flex items-center gap-2">
            <button type="submit" className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-bold hover:bg-neutral-800">Încarcă</button>
            <button type="button" onClick={generateHero} className="rounded-full border px-5 py-2 text-sm">Generează SVG tematic</button>
          </div>
        </form>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Tip</label>
          <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="rounded-full border px-3 py-1.5 text-sm">
            <option value="">Toate</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Caută</label>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} className="rounded-full border px-3 py-1.5 text-sm" placeholder="Titlu / URL" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="rounded-xl border border-neutral-200 overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.url} alt={a.title || a.type} className="w-full h-40 object-cover" />
            <div className="p-3 space-y-2">
              <div className="text-sm font-medium text-neutral-900">{a.title || '—'} <span className="ml-2 text-xs text-neutral-500">[{a.type}]</span></div>
              <div className="text-xs text-neutral-500 break-all">{a.url}</div>
              <div className="flex items-center gap-2 text-xs">
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={!!a.active} onChange={e=>update(a.id, { active: e.target.checked })}/> activ</label>
                <label className="inline-flex items-center gap-1"><span>Ordine</span><input type="number" className="w-16 border rounded px-1 py-0.5" defaultValue={a.sort_order || 0} onBlur={(e)=>update(a.id, { sort_order: parseInt(e.target.value)||0 })} /></label>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>del(a.id)} className="text-red-600 text-sm">Șterge</button>
                <a className="underline text-blue-700 text-sm" href={a.url} target="_blank">Deschide</a>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-neutral-500">Nu sunt imagini încă</div>}
      </div>
    </div>
  );
}