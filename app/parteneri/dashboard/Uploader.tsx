'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error('Selectează un fișier');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUrl(data.url);
      toast.success('Încărcare reușită');
    } catch (e: any) {
      toast.error(e.message || 'Eroare la încărcare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="font-medium text-neutral-900">Încărcare materiale (R2)</h3>
      <div className="mt-3 flex items-center gap-3">
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
        <button onClick={handleUpload} disabled={loading} className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50">
          {loading ? 'Se încarcă...' : 'Încarcă'}
        </button>
      </div>
      {url && (
        <div className="mt-3 text-sm">
          Link public: <a href={url} target="_blank" className="text-neutral-900 underline">{url}</a>
        </div>
      )}
    </div>
  );
}
