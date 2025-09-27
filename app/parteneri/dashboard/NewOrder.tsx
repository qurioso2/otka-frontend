'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface OrderItem {
  rowNumber: number;
  manufacturerName: string;
  productCode: string;
  quantity: number;
  finishCode?: string;
  partnerPrice?: number;
}

export default function NewOrder() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([
    { rowNumber: 1, manufacturerName: '', productCode: '', quantity: 1 }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, {
      rowNumber: items.length + 1,
      manufacturerName: '',
      productCode: '',
      quantity: 1
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      // Renumerotează rândurile
      newItems.forEach((item, i) => item.rowNumber = i + 1);
      setItems(newItems);
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validare de bază
      const validItems = items.filter(item => 
        item.manufacturerName.trim() && 
        item.productCode.trim() && 
        item.quantity > 0
      );

      if (validItems.length === 0) {
        throw new Error('Adăugați cel puțin un produs valid');
      }

      const res = await fetch('/api/partners/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validItems,
          partner_notes: notes
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      toast.success(`Comanda ${data.order_number} a fost creată!`);
      router.push(`/parteneri/orders/${data.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Eroare la salvare';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) throw new Error('Fișierul CSV trebuie să aibă header și cel puțin o linie de date');

        // Skip header line
        const dataLines = lines.slice(1);
        const newItems: OrderItem[] = [];

        dataLines.forEach((line, index) => {
          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          if (columns.length >= 4) {
            newItems.push({
              rowNumber: index + 1,
              manufacturerName: columns[1] || '',
              productCode: columns[2] || '',
              quantity: parseInt(columns[3]) || 1,
              finishCode: columns[4] || '',
              partnerPrice: columns[5] ? parseFloat(columns[5]) : undefined
            });
          }
        });

        if (newItems.length > 0) {
          setItems(newItems);
          toast.success(`Importate ${newItems.length} produse din CSV`);
        }
      } catch (e) {
        toast.error('Eroare la parsarea fișierului CSV');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-neutral-900">Comandă Nouă</h3>
            <p className="text-sm text-neutral-600 mt-1">Introduceți produsele pentru o ofertă personalizată</p>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition">
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={importFromCSV}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <div className="text-xs text-neutral-500 mb-2">
            Format CSV: Nr.Crt, Nume Producător, Cod Produs, Cantitate, Finisaj, Preț (opțional)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-2 text-sm font-medium text-neutral-700">Nr.Crt</th>
                <th className="text-left py-2 text-sm font-medium text-neutral-700">Nume Producător</th>
                <th className="text-left py-2 text-sm font-medium text-neutral-700">Cod Produs</th>
                <th className="text-left py-2 text-sm font-medium text-neutral-700">Cantitate</th>
                <th className="text-left py-2 text-sm font-medium text-neutral-700">Finisaj</th>
                <th className="text-left py-2 text-sm font-medium text-neutral-700">Preț Est. (RON)</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-neutral-100">
                  <td className="py-2">
                    <input
                      type="number"
                      value={item.rowNumber}
                      onChange={(e) => updateItem(index, 'rowNumber', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm"
                      min="1"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={item.manufacturerName}
                      onChange={(e) => updateItem(index, 'manufacturerName', e.target.value)}
                      placeholder="Apple, Samsung, etc."
                      className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                      required
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={item.productCode}
                      onChange={(e) => updateItem(index, 'productCode', e.target.value)}
                      placeholder="iPhone14-128GB"
                      className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                      required
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 border border-neutral-300 rounded text-sm"
                      min="1"
                      required
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={item.finishCode || ''}
                      onChange={(e) => updateItem(index, 'finishCode', e.target.value)}
                      placeholder="BLK, WHT"
                      className="w-24 px-2 py-1 border border-neutral-300 rounded text-sm"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={item.partnerPrice || ''}
                      onChange={(e) => updateItem(index, 'partnerPrice', parseFloat(e.target.value) || undefined)}
                      placeholder="2999"
                      step="0.01"
                      className="w-24 px-2 py-1 border border-neutral-300 rounded text-sm"
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={items.length === 1}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={addItem}
            className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-full text-sm hover:bg-neutral-200 transition"
          >
            + Adaugă Rând
          </button>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Observații suplimentare
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mențiuni speciale, termene de livrare, etc."
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-xl resize-none"
          />
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2.5 rounded-full font-medium hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? 'Se salvează...' : 'Salvare și Trimitere pentru Verificare'}
          </button>
          <button
            type="button"
            className="border border-neutral-300 text-neutral-700 px-6 py-2.5 rounded-full font-medium hover:bg-neutral-50 transition"
          >
            Salvare Draft
          </button>
        </div>
      </form>
    </div>
  );
}