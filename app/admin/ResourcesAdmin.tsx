'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const TYPES = [
  { value: 'price_list', label: 'Listă Prețuri' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'materials', label: 'Materiale' },
  { value: 'images', label: 'Imagini' },
];

type Resource = {
  id: string;
  name: string;
  description?: string | null;
  file_type: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
  visible: boolean;
  partner_access: boolean;
  created_at?: string;
};

export default function ResourcesAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState<string>('price_list');

  // Upload form state
  const [manufacturer, setManufacturer] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('price_list');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resources/list', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Load failed');
      setResources(json.resources || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return resources.filter(r => {
      const matchText = (r.name || '').toLowerCase().includes(term) || (r.description || '').toLowerCase().includes(term);
      const matchType = !fileType || r.file_type === fileType;
      return matchText && matchType;
    });
  }, [resources, search, fileType]);

  const doUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Alegeți un fișier');
    if (!manufacturer || !title) return toast.error('Completați producătorul și titlul');

    try {
      setLoading(true);
      // 1) Upload către R2
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const upJson = await up.json();
      if (!up.ok) throw new Error(upJson.error || 'Upload a eșuat');

      // 2) Creare resursă în Supabase
      const name = `${manufacturer} - ${title}`;
      const body = {
        name,
        description: desc || undefined,
        file_type: type,
        file_url: upJson.url,
        file_size: file.size,
        mime_type: file.type,
        visible: true,
        partner_access: true,
      };
      const res = await fetch('/api/admin/resources/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Salvare a eșuat');
      toast.success('Resursă adăugată');
      // Reset
      setManufacturer(''); setTitle(''); setDesc(''); setType('price_list'); setFile(null);
      (document.getElementById('res-file') as HTMLInputElement | null)?.value && ((document.getElementById('res-file') as HTMLInputElement).value = '');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  const update = async (id: string, patch: Partial<Resource>) => {
    const res = await fetch('/api/admin/resources/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Update failed');
  };

  const startEdit = (r: Resource) => {
    setEditingId(r.id);
    setEditName(r.name);
    setEditDesc(r.description || '');
    setEditType(r.file_type);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await update(editingId, { name: editName, description: editDesc, file_type: editType });
      toast.success('Salvat');
      setEditingId(null);
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  const del = async (id: string) => {
    if (!confirm('Ștergi această resursă?')) return;
    try {
      const res = await fetch('/api/admin/resources/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      toast.success('Ștearsă');
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const duplicate = async (r: Resource, newType?: string) => {
    try {
      const body = {
        name: r.name + ' (copy)',
        description: r.description || undefined,
        file_type: newType || r.file_type,
        file_url: r.file_url,
        file_size: r.file_size || undefined,
        mime_type: r.mime_type || undefined,
        visible: r.visible,
        partner_access: r.partner_access,
      };
      const res = await fetch('/api/admin/resources/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Duplication failed');
      toast.success('Duplicat creat');
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  const moveToType = async (r: Resource, newType: string) => {
    try {
      await update(r.id, { file_type: newType });
      toast.success('Mutat');
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  const reuploadRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const triggerReupload = (id: string) => reuploadRefs.current[id]?.click();
  const onReupload = async (r: Resource, file?: File | null) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const upJson = await up.json();
      if (!up.ok) throw new Error(upJson.error || 'Upload a eșuat');
      await update(r.id, { file_url: upJson.url, file_size: file.size, mime_type: file.type });
      toast.success('Fișier înlocuit');
      load();
    } catch (e:any) { toast.error(e.message); }
  };

  const openPreview = (r: Resource) => {
    setPreviewUrl(r.file_url);
    setPreviewName(r.name);
  };

  const isPdf = (url?: string) => !!url && (url.endsWith('.pdf') || url.includes('application/pdf'));

  return (
    <div className="space-y-6" data-testid="resources-admin">
      {/* Upload form */}
      <div className="rounded-2xl border-2 border-neutral-300 bg-white p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Încarcă Resursă (R2)</h3>
        <form onSubmit={doUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Producător</label>
            <input value={manufacturer} onChange={(e)=>setManufacturer(e.target.value)} className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500" placeholder="Apple, Samsung..." required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Titlu Document</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500" placeholder="Catalog 2025, Lista preț Q3..." required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Tip</label>
            <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500">{TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Descriere (opțional)</label>
            <input value={desc} onChange={(e)=>setDesc(e.target.value)} className="w-full rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500" placeholder="Detalii" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-neutral-800 mb-1">Fișier</label>
            <input id="res-file" type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} className="w-full" required />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="submit" disabled={loading} className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-bold hover:bg-neutral-800">{loading ? 'Se încarcă...' : 'Încarcă'}</button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Caută</label>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} className="rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500" placeholder="Producător sau titlu" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Tip</label>
          <select value={fileType} onChange={(e)=>setFileType(e.target.value)} className="rounded-xl border-2 border-neutral-300 px-3 py-2 focus:border-blue-500">
            <option value="">Toate</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button onClick={load} className="rounded-full border-2 border-neutral-300 px-4 py-2 text-sm font-bold hover:bg-neutral-50">Reîncarcă</button>
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="px-4 py-3">Nume</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Vizibil</th>
              <th className="px-4 py-3">Parteneri</th>
              <th className="px-4 py-3">Fișier</th>
              <th className="px-4 py-3">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-neutral-200">
                <td className="px-4 py-3 align-top">
                  {editingId === r.id ? (
                    <>
                      <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-2 py-1 mb-1" />
                      <input value={editDesc} onChange={(e)=>setEditDesc(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-2 py-1" placeholder="Descriere" />
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-neutral-900">{r.name}</div>
                      <div className="text-neutral-500 text-xs">{r.description}</div>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  {editingId === r.id ? (
                    <select value={editType} onChange={(e)=>setEditType(e.target.value)} className="rounded-lg border border-neutral-300 px-2 py-1">
                      {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  ) : (
                    TYPES.find(t=>t.value===r.file_type)?.label || r.file_type
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={r.visible} onChange={async (e)=>{ try{ await update(r.id, { visible: e.target.checked }); toast.success('Salvat'); load(); } catch(e:any){ toast.error(e.message);} }} /> Vizibil
                  </label>
                </td>
                <td className="px-4 py-3 align-top">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={r.partner_access} onChange={async (e)=>{ try{ await update(r.id, { partner_access: e.target.checked }); toast.success('Salvat'); load(); } catch(e:any){ toast.error(e.message);} }} /> Acces parteneri
                  </label>
                </td>
                <td className="px-4 py-3 align-top space-x-2">
                  <button onClick={()=>openPreview(r)} className="underline text-blue-700">Previzualizează</button>
                  <a className="underline text-blue-700" href={r.file_url} target="_blank">Descarcă</a>
                </td>
                <td className="px-4 py-3 align-top space-x-2">
                  {editingId === r.id ? (
                    <>
                      <button onClick={saveEdit} className="text-green-700 hover:text-green-900">Salvează</button>
                      <button onClick={()=>setEditingId(null)} className="text-neutral-600 hover:text-neutral-800">Renunță</button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>startEdit(r)} className="text-blue-700 hover:text-blue-900">Editează</button>
                      <button onClick={()=>duplicate(r)} className="text-neutral-700 hover:text-neutral-900">Duplică</button>
                      <div className="inline-flex items-center gap-1">
                        <span className="text-xs text-neutral-500">Mută în:</span>
                        <select onChange={(e)=>{ if(e.target.value) moveToType(r, e.target.value); }} defaultValue="" className="text-xs border border-neutral-300 rounded px-1 py-0.5">
                          <option value="">Selectează</option>
                          {TYPES.filter(t=>t.value!==r.file_type).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <button onClick={()=>triggerReupload(r.id)} className="text-purple-700 hover:text-purple-900">Înlocuiește fișier</button>
                      <input ref={el => reuploadRefs.current[r.id] = el} type="file" hidden onChange={(e)=>onReupload(r, e.target.files?.[0])} />
                      <button onClick={()=>del(r.id)} className="text-red-600 hover:text-red-800">Șterge</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-500">Nu sunt resurse</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[80vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold text-neutral-900 truncate pr-4">{previewName}</div>
              <button onClick={()=>setPreviewUrl(null)} className="text-neutral-600 hover:text-neutral-900">Închide</button>
            </div>
            <div className="w-full h-full">
              {isPdf(previewUrl) ? (
                <iframe src={previewUrl} className="w-full h-full" title="PDF preview" />
              ) : (
                <div className="p-6 text-center">
                  <a href={previewUrl} target="_blank" className="underline text-blue-700">Deschide fișierul</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}