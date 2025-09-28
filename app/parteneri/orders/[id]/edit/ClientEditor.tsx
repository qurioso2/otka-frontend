'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ClientEditor({ id, initialItems, initialNotes }: { id: string; initialItems: any[]; initialNotes: string }) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialItems);
  const [notes, setNotes] = useState<string>(initialNotes);
  const [loading, setLoading] = useState(false);

  const addRow = () => setItems([...items, { rowNumber: items.length + 1, manufacturerName:'', productCode:'', quantity:1 }]);
  const update = (i: number, k: string, v: any) => setItems(items.map((it, idx) => idx===i ? { ...it, [k]: v } : it));
  const remove = (i: number) => setItems(items.filter((_, idx) => idx!==i).map((it, idx) => ({ ...it, rowNumber: idx+1 })));

  const save = async (submit?: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners/orders/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, items, partner_notes: notes }) });
      if (!res.ok) throw new Error(await res.text());
      if (submit) {
        // change status to submitted
        const s = await fetch('/api/partners/orders/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, patch: { status: 'submitted', submitted_at: new Date().toISOString() } }) });
        if (!s.ok) throw new Error(await s.text());
      }
      toast.success(submit ? 'Trimis pentru verificare' : 'Draft salvat');
      router.push(`/parteneri/orders/${id}`);
    } catch (e:any) { toast.error(e.message || 'Eroare'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">#</th>
              <th className="text-left py-2">Producător</th>
              <th className="text-left py-2">Cod</th>
              <th className="text-left py-2">Cant</th>
              <th className="text-left py-2">Finisaj</th>
              <th className="text-left py-2">Preț</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b">
                <td className="py-2"><input type="number" value={it.rowNumber} onChange={(e)=>update(i,'rowNumber', parseInt(e.target.value)||1)} className="w-16 border rounded px-2 py-1" /></td>
                <td className="py-2"><input value={it.manufacturerName} onChange={(e)=>update(i,'manufacturerName', e.target.value)} className="w-full border rounded px-2 py-1" /></td>
                <td className="py-2"><input value={it.productCode} onChange={(e)=>update(i,'productCode', e.target.value)} className="w-full border rounded px-2 py-1" /></td>
                <td className="py-2"><input type="number" value={it.quantity} onChange={(e)=>update(i,'quantity', parseInt(e.target.value)||1)} className="w-20 border rounded px-2 py-1" /></td>
                <td className="py-2"><input value={it.finishCode||''} onChange={(e)=>update(i,'finishCode', e.target.value)} className="w-24 border rounded px-2 py-1" /></td>
                <td className="py-2"><input type="number" step="0.01" value={it.partnerPrice||''} onChange={(e)=>update(i,'partnerPrice', parseFloat(e.target.value)||undefined)} className="w-24 border rounded px-2 py-1" /></td>
                <td className="py-2"><button onClick={()=>remove(i)} className="text-red-600">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3"><button onClick={addRow} className="rounded-full border px-3 py-1.5 text-sm">+ Rând</button></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Observații</label>
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={3} className="w-full border rounded px-3 py-2" />
      </div>

      <div className="flex gap-2">
        <button onClick={()=>save(false)} disabled={loading} className="rounded-full border px-5 py-2 text-sm">Salvează Draft</button>
        <button onClick={()=>save(true)} disabled={loading} className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm">Trimite pentru verificare</button>
      </div>
    </div>
  );
}