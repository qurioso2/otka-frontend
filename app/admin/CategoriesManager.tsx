'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  sort_order: number;
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Nume categorie obligatoriu');
      return;
    }

    try {
      const res = await fetch('/api/admin/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }

      toast.success('Categorie adăugată!');
      setFormData({ name: '', description: '', sort_order: 0 });
      setShowAddForm(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) {
      toast.error('Nume categorie obligatoriu');
      return;
    }

    try {
      const res = await fetch('/api/admin/categories/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...formData })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }

      toast.success('Categorie actualizată!');
      setEditingId(null);
      setFormData({ name: '', description: '', sort_order: 0 });
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const res = await fetch('/api/admin/categories/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          name: category.name,
          active: !category.active
        })
      });

      if (!res.ok) throw new Error('Failed to toggle');
      toast.success(category.active ? 'Categorie ascunsă' : 'Categorie afișată');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur vrei să ștergi această categorie?')) return;

    try {
      const res = await fetch('/api/admin/categories/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }

      const result = await res.json();
      toast.success(result.message || 'Categorie ștearsă');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      sort_order: category.sort_order
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Management Categorii</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
        >
          <Plus className="w-5 h-5" />
          Adaugă Categorie
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h3 className="font-bold mb-3">Categorie Nouă</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nume categorie"
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
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
              placeholder="Ordinea sortării"
              className="w-32 px-3 py-2 border-2 border-neutral-300 rounded-lg"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
              >
                Salvează
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', description: '', sort_order: 0 });
                }}
                className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-8">Se încarcă...</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 border-2 rounded-lg ${
                cat.active ? 'border-neutral-300 bg-white' : 'border-neutral-200 bg-neutral-50 opacity-60'
              }`}
            >
              {editingId === cat.id ? (
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
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    className="w-32 px-3 py-2 border-2 border-neutral-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                    >
                      Salvează
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', description: '', sort_order: 0 });
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
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                      <span className="text-xs text-neutral-500">#{cat.sort_order}</span>
                      {!cat.active && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          Ascuns
                        </span>
                      )}
                    </div>
                    {cat.description && (
                      <p className="text-sm text-neutral-600 mt-1">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`p-2 rounded-lg transition ${
                        cat.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                      title={cat.active ? 'Ascunde' : 'Afișează'}
                    >
                      {cat.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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

      {!loading && categories.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          Nicio categorie. Adaugă prima categorie!
        </div>
      )}
    </div>
  );
}
