'use client';

import { useState, useEffect } from 'react';
import { Percent, Plus, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

type TaxRate = {
  id: number;
  name: string;
  rate: number;
  active: boolean;
  is_default: boolean;
  description?: string;
  effective_from?: string;
  sort_order: number;
  created_at: string;
};

export default function TaxRatesManager() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    active: true,
    is_default: false,
    description: '',
    effective_from: '',
  });

  const [bulkUpdate, setBulkUpdate] = useState({
    old_rate_id: '',
    new_rate_id: '',
  });

  const loadTaxRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tax-rates/list', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setTaxRates(data.data || []);
      }
    } catch (error: any) {
      showNotification('error', 'Eroare la încărcarea cotelor TVA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxRates();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editingRate
        ? '/api/admin/tax-rates/update'
        : '/api/admin/tax-rates/create';

      const payload = editingRate
        ? { id: editingRate.id, ...formData, rate: parseFloat(formData.rate) }
        : { ...formData, rate: parseFloat(formData.rate) };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', editingRate ? 'Cotă actualizată!' : 'Cotă creată!');
        setShowAddModal(false);
        setEditingRate(null);
        resetForm();
        loadTaxRates();
      } else {
        showNotification('error', data.error || 'Eroare la salvare');
      }
    } catch (error: any) {
      showNotification('error', 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur ștergi această cotă TVA?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/tax-rates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', data.message || 'Cotă ștearsă!');
        loadTaxRates();
      } else {
        showNotification('error', data.error || 'Eroare la ștergere');
      }
    } catch (error: any) {
      showNotification('error', 'Eroare la ștergere');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (rate: TaxRate) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tax-rates/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rate.id, active: !rate.active }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', 'Status actualizat!');
        loadTaxRates();
      } else {
        showNotification('error', data.error || 'Eroare');
      }
    } catch (error: any) {
      showNotification('error', 'Eroare');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkUpdate.old_rate_id || !bulkUpdate.new_rate_id) {
      showNotification('error', 'Selectează ambele cote TVA');
      return;
    }

    if (!confirm('Sigur actualizezi toate produsele cu noua cotă TVA?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/tax-rates/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_rate_id: parseInt(bulkUpdate.old_rate_id),
          new_rate_id: parseInt(bulkUpdate.new_rate_id),
        }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', `${data.affected_count} produse actualizate!`);
        setShowBulkUpdateModal(false);
        setBulkUpdate({ old_rate_id: '', new_rate_id: '' });
      } else {
        showNotification('error', data.error || 'Eroare');
      }
    } catch (error: any) {
      showNotification('error', 'Eroare');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate: TaxRate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.name,
      rate: rate.rate.toString(),
      active: rate.active,
      is_default: rate.is_default,
      description: rate.description || '',
      effective_from: rate.effective_from || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      rate: '',
      active: true,
      is_default: false,
      description: '',
      effective_from: '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-[10px] shadow-lg ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
            : 'bg-red-50 text-red-800 ring-1 ring-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-[10px]">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
            Gestionare Cote TVA
          </h1>
          <p className="text-sm text-slate-600 mt-1">Administrează cotele TVA pentru produse</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadTaxRates()}
            disabled={loading}
            className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-[10px] hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
            data-testid="refresh-tax-rates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reîmprospătează
          </button>
          <button
            onClick={() => setShowBulkUpdateModal(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-[10px] hover:bg-amber-600 transition-colors flex items-center gap-2 font-medium"
            data-testid="bulk-update-btn"
          >
            <RefreshCw className="w-4 h-4" />
            Update Masiv
          </button>
          <button
            onClick={() => {
              setEditingRate(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            data-testid="add-tax-rate-btn"
          >
            <Plus className="w-4 h-4" />
            Adaugă Cotă TVA
          </button>
        </div>
      </div>

      {/* Tax Rates Table */}
      <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Nume Cotă</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Procent (%)</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Status</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Default</th>
              <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Descriere</th>
              <th className="text-right px-6 py-4 text-sm font-bold text-slate-900">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {loading && taxRates.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Se încarcă...
                </td>
              </tr>
            ) : taxRates.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  Nu există cote TVA
                </td>
              </tr>
            ) : (
              taxRates.map((rate, idx) => (
                <tr
                  key={rate.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/50' : ''
                  }`}
                  data-testid={`tax-rate-row-${rate.id}`}
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{rate.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                      {rate.rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(rate)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ring-1 ${
                        rate.active
                          ? 'bg-green-50 text-green-700 ring-green-200'
                          : 'bg-slate-100 text-slate-600 ring-slate-200'
                      }`}
                      data-testid={`toggle-active-${rate.id}`}
                    >
                      {rate.active ? '✓ Activ' : '✗ Inactiv'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {rate.is_default && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium ring-1 ring-purple-200">
                        ⭐ Default
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {rate.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        data-testid={`edit-rate-${rate.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rate.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`delete-rate-${rate.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[10px] max-w-2xl w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingRate ? 'Editează Cotă TVA' : 'Adaugă Cotă TVA Nouă'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Nume Cotă *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Standard 2025"
                    required
                    data-testid="field-rate-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Procent TVA (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="21.00"
                    required
                    data-testid="field-rate-value"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Descriere</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Când se aplică această cotă..."
                  data-testid="field-description"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    data-testid="field-active"
                  />
                  <span className="text-sm font-medium text-slate-700">Activ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    data-testid="field-is-default"
                  />
                  <span className="text-sm font-medium text-slate-700">Cotă implicită (default)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRate(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-[10px] hover:bg-slate-50 transition-colors font-medium"
                  data-testid="cancel-btn"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  data-testid="submit-rate-btn"
                >
                  {loading ? 'Se salvează...' : editingRate ? 'Actualizează' : 'Creează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[10px] max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Update Masiv Cote TVA</h2>
            <p className="text-sm text-slate-600 mb-6">
              Actualizează toate produsele de la o cotă TVA la alta.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">De la cota</label>
                <select
                  value={bulkUpdate.old_rate_id}
                  onChange={(e) => setBulkUpdate({ ...bulkUpdate, old_rate_id: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="bulk-old-rate"
                >
                  <option value="">Selectează...</option>
                  {taxRates.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.name} ({rate.rate}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">La cota</label>
                <select
                  value={bulkUpdate.new_rate_id}
                  onChange={(e) => setBulkUpdate({ ...bulkUpdate, new_rate_id: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="bulk-new-rate"
                >
                  <option value="">Selectează...</option>
                  {taxRates.filter((r) => r.active).map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.name} ({rate.rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowBulkUpdateModal(false);
                  setBulkUpdate({ old_rate_id: '', new_rate_id: '' });
                }}
                className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-[10px] hover:bg-slate-50 transition-colors font-medium"
              >
                Anulează
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={loading || !bulkUpdate.old_rate_id || !bulkUpdate.new_rate_id}
                className="px-4 py-2 bg-amber-500 text-white rounded-[10px] hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
                data-testid="confirm-bulk-update"
              >
                {loading ? 'Se actualizează...' : 'Actualizează Toate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
