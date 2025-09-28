'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type Resource = {
  id: string;
  name: string;
  description?: string;
  file_type: 'price_list' | 'catalog' | 'images' | 'materials' | 'manual';
  file_url: string;
  file_size?: number;
  mime_type?: string;
  visible: boolean;
  partner_access: boolean;
  created_at: string;
  updated_at: string;
};

const resourceTypes = {
  price_list: '💰 Listă Prețuri',
  catalog: '📋 Catalog Produse',
  images: '🖼️ Imagini Marketing',
  materials: '📦 Materiale Promoționale',
  manual: '📖 Manual Utilizare'
};

export default function ResourcesAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    file_type: 'catalog' as keyof typeof resourceTypes,
    file_url: '',
    visible: true,
    partner_access: true
  });

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resources/list');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load resources');
      setResources(data.resources || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/resources/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create resource');

      toast.success('Resursă adăugată cu succes!');
      setNewResource({
        name: '',
        description: '',
        file_type: 'catalog',
        file_url: '',
        visible: true,
        partner_access: true
      });
      setShowAddForm(false);
      loadResources();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleResourceStatus = async (resourceId: string, field: 'visible' | 'partner_access', value: boolean) => {
    try {
      const res = await fetch('/api/admin/resources/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resource_id: resourceId, 
          [field]: value 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update resource');

      toast.success('Resursă actualizată!');
      loadResources();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Sigur doriți să ștergeți această resursă?')) return;
    
    try {
      const res = await fetch('/api/admin/resources/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete resource');

      toast.success('Resursă ștearsă!');
      loadResources();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-sm">
        <div className="p-6 border-b-2 border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📚 Resurse pentru Parteneri</h2>
              <p className="mt-1 text-gray-700 font-medium">Gestionează cataloagele, listele de prețuri și materialele pentru parteneri</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 font-semibold transition"
            >
              {showAddForm ? '✕ Anulează' : '➕ Adaugă Resursă'}
            </button>
          </div>
        </div>

        {/* Add Resource Form */}
        {showAddForm && (
          <div className="otka-card-body border-t-2 border-otka-gray-200">
            <h3 className="otka-heading-3 mb-4">Adaugă Resursă Nouă</h3>
            <form onSubmit={addResource} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block otka-text-bold mb-2">Nume Resursă *</label>
                  <input
                    type="text"
                    value={newResource.name}
                    onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                    className="otka-input"
                    placeholder="ex: Catalog Mobilier 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block otka-text-bold mb-2">Tip Resursă *</label>
                  <select
                    value={newResource.file_type}
                    onChange={(e) => setNewResource({...newResource, file_type: e.target.value as any})}
                    className="otka-select"
                  >
                    {Object.entries(resourceTypes).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block otka-text-bold mb-2">URL Fișier *</label>
                  <input
                    type="url"
                    value={newResource.file_url}
                    onChange={(e) => setNewResource({...newResource, file_url: e.target.value})}
                    className="otka-input"
                    placeholder="https://cdn.otka.ro/resources/catalog-2025.pdf"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block otka-text-bold mb-2">Descriere</label>
                  <textarea
                    rows={3}
                    value={newResource.description}
                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    className="otka-input"
                    placeholder="Descrierea resursei și cum o pot folosi partenerii..."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newResource.visible}
                      onChange={(e) => setNewResource({...newResource, visible: e.target.checked})}
                      className="mr-2 h-4 w-4 text-otka-blue-600 focus:ring-otka-blue-500 border-otka-gray-300 rounded"
                    />
                    <span className="otka-text-bold">Vizibilă</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newResource.partner_access}
                      onChange={(e) => setNewResource({...newResource, partner_access: e.target.checked})}
                      className="mr-2 h-4 w-4 text-otka-blue-600 focus:ring-otka-blue-500 border-otka-gray-300 rounded"
                    />
                    <span className="otka-text-bold">Acces Parteneri</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="otka-btn otka-btn-secondary otka-btn-md"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="otka-btn otka-btn-success otka-btn-md"
                  disabled={loading}
                >
                  {loading ? 'Se salvează...' : '✅ Salvează Resursa'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Resources List */}
      <div className="otka-card">
        <div className="otka-card-header">
          <h3 className="otka-heading-3">Resurse Existente ({resources.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="otka-table">
            <thead className="otka-table-header">
              <tr>
                <th className="otka-table-header-cell">Resursă</th>
                <th className="otka-table-header-cell">Tip</th>
                <th className="otka-table-header-cell">Status</th>
                <th className="otka-table-header-cell">Acces</th>
                <th className="otka-table-header-cell">Data</th>
                <th className="otka-table-header-cell">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {resources.map((resource, index) => (
                <tr key={resource.id} className={`${index % 2 === 0 ? 'bg-otka-gray-50' : 'bg-white'} border-b border-otka-gray-200`}>
                  <td className="otka-table-cell">
                    <div>
                      <div className="font-bold text-otka-gray-900">{resource.name}</div>
                      {resource.description && (
                        <div className="text-xs text-otka-gray-600 mt-1">{resource.description}</div>
                      )}
                      <a 
                        href={resource.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-otka-blue-600 hover:text-otka-blue-800 underline"
                      >
                        Vezi fișierul →
                      </a>
                    </div>
                  </td>
                  <td className="otka-table-cell">
                    <span className="otka-badge otka-badge-info">
                      {resourceTypes[resource.file_type]}
                    </span>
                  </td>
                  <td className="otka-table-cell">
                    <button
                      onClick={() => toggleResourceStatus(resource.id, 'visible', !resource.visible)}
                      className={`otka-badge ${resource.visible ? 'otka-badge-success' : 'otka-badge-error'}`}
                    >
                      {resource.visible ? '👁️ Vizibilă' : '🙈 Ascunsă'}
                    </button>
                  </td>
                  <td className="otka-table-cell">
                    <button
                      onClick={() => toggleResourceStatus(resource.id, 'partner_access', !resource.partner_access)}
                      className={`otka-badge ${resource.partner_access ? 'otka-badge-success' : 'otka-badge-warning'}`}
                    >
                      {resource.partner_access ? '✅ Acces' : '🚫 Blocat'}
                    </button>
                  </td>
                  <td className="otka-table-cell">
                    <div className="text-otka-gray-700 font-medium">
                      {new Date(resource.created_at).toLocaleDateString('ro-RO')}
                    </div>
                  </td>
                  <td className="otka-table-cell">
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="otka-btn otka-btn-sm bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                    >
                      🗑️ Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {resources.length === 0 && (
            <div className="text-center py-12">
              <div className="text-otka-gray-400 text-4xl mb-4">📚</div>
              <p className="otka-text-bold mb-2">Nu există resurse pentru parteneri</p>
              <p className="otka-text-sm">Adaugă prima resursă pentru a o pune la dispoziția partenerilor</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="mt-4 otka-btn otka-btn-primary otka-btn-md"
              >
                ➕ Adaugă Prima Resursă
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}