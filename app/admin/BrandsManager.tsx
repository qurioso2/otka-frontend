'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

type Brand = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  active: boolean;
  sort_order: number;
};

export default function BrandsManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    sort_order: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Nume brand obligatoriu');
      return;
    }

    try {
      const res = await fetch('/api/admin/brands/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }

      toast.success('Brand adăugat!');
      setFormData({ name: '', description: '', website: '', sort_order: 0 });
      setShowAddForm(false);
      loadBrands();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) {
      toast.error('Nume brand obligatoriu');
      return;
    }

    try {
      const res = await fetch('/api/admin/brands/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }

      toast.success('Brand actualizat!');
      setEditingId(null);
      setFormData({ name: '', description: '', website: '', sort_order: 0 });
      loadBrands();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      const res = await fetch('/api/admin/brands/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: brand.id,
          name: brand.name,
          active: !brand.active
        })
      });

      if (!res.ok) throw new Error('Failed to toggle');
      toast.success(brand.active ? 'Brand ascuns' : 'Brand afișat');
      loadBrands();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi acest brand?')) return;

    try {
      const res = await fetch('/api/admin/brands/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }

      const result = await res.json();
      toast.success(result.message || 'Brand șters');
      loadBrands();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      website: brand.website || '',
      sort_order: brand.sort_order
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Management Branduri</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
        >
          <Plus className="w-5 h-5" />
          Adaugă Brand
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <h3 className="font-bold mb-3">Brand Nou</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nume brand"
              className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg"
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descriere (opțional)"
              className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg"
              rows={2}
            />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="Website (opțional)"
              className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg"
            />
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
              placeholder="Ordinea sortării"
              className="w-32 px-3 py-2 border-2 border-neutral-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
              >
                Salvează
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', description: '', website: '', sort_order: 0 });
                }}
                className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brands List */}
      {loading ? (
        <div className="text-center py-8">Se încarcă...</div>
      ) : (
        <div className="space-y-3">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className={`p-4 border-2 rounded-lg ${
                brand.active ? 'border-neutral-300 bg-white' : 'border-neutral-200 bg-neutral-50 opacity-60'
              }`}
            >
              {editingId === brand.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg font-bold"
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg"
                    rows={2}
                  />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="Website"
                    className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg"
                  />
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    className="w-32 px-3 py-2 border-2 border-neutral-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(brand.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
                    >
                      Salvează
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', description: '', website: '', sort_order: 0 });
                      }}
                      className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{brand.name}</h3>
                      <span className="text-xs text-neutral-500">#{brand.sort_order}</span>
                      {!brand.active && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          Ascuns
                        </span>
                      )}
                    </div>
                    {brand.description && (
                      <p className="text-sm text-neutral-600 mt-1">{brand.description}</p>
                    )}
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline mt-1 inline-block"
                      >
                        {brand.website}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(brand)}
                      className={`p-2 rounded-lg transition ${
                        brand.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                      title={brand.active ? 'Ascunde' : 'Afișează'}
                    >
                      {brand.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => startEdit(brand)}
                      className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      title="Șterge"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && brands.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          Niciun brand. Adaugă primul brand!
        </div>
      )}
    </div>
  );
}
