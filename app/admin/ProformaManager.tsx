'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Mail, CheckCircle, Trash2, RefreshCw, Search, Filter, AlertCircle, X } from 'lucide-react';

type Proforma = {
  id: number;
  series: string;
  number: number;
  full_number: string;
  issue_date: string;
  client_type: 'PF' | 'PJ';
  client_name: string;
  client_email?: string;
  currency: string;
  subtotal_no_vat: number;
  total_vat: number;
  total_with_vat: number;
  status: 'pending' | 'paid' | 'cancelled';
  email_sent_at?: string;
};

type ProformaItem = {
  product_id?: number;
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate_id: number;
  tax_rate_value: number;
};

type Product = {
  id: number;
  sku: string;
  name: string;
  price_partner_net: number;
  tax_rate_id?: number;
};

type TaxRate = {
  id: number;
  name: string;
  rate: number;
};

export default function ProformaManager() {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');
  const [proforme, setProforme] = useState<Proforma[]>([]);
  const [stats, setStats] = useState({
    total_proforme: 0,
    total_paid: 0,
    total_pending: 0,
    suma_incasata: 0,
    suma_in_asteptare: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Create proforma state
  const [clientType, setClientType] = useState<'PF' | 'PJ'>('PF');
  const [clientData, setClientData] = useState({
    client_name: '',
    client_cui: '',
    client_reg_com: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    client_city: '',
    client_county: '',
  });
  const [items, setItems] = useState<ProformaItem[]>([]);
  const [currency, setCurrency] = useState<'RON' | 'EUR'>('RON');
  const [clientNotes, setClientNotes] = useState('');
  
  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedProformaId, setSelectedProformaId] = useState<number | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    if (activeView === 'list') {
      loadProforme();
      loadStats();
    }
  }, [activeView, searchTerm, statusFilter]);

  useEffect(() => {
    if (activeView === 'create') {
      loadProducts();
      loadTaxRates();
    }
  }, [activeView]);

  const loadProforme = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/admin/proforme/list?${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setProforme(data.data || []);
      }
    } catch (error) {
      showNotification('error', 'Eroare la încărcarea proformelor');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/proforme/stats', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products/list', { cache: 'no-store' });
      const data = await res.json();
      console.log('Products API response:', data);
      
      // Handle both formats: direct array or { products: [...] }
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.error('Unexpected products API format:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadTaxRates = async () => {
    try {
      const res = await fetch('/api/admin/tax-rates/list', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setTaxRates(data.data || []);
      }
    } catch (error) {
      console.error('Error loading tax rates:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadPDF = async (id: number) => {
    try {
      const res = await fetch('/api/admin/proforme/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Proforma-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('success', 'PDF descărcat!');
      } else {
        showNotification('error', 'Eroare la generarea PDF');
      }
    } catch (error) {
      showNotification('error', 'Eroare la generarea PDF');
    }
  };

  const handleSendEmail = async () => {
    if (!selectedProformaId || !emailTo) {
      showNotification('error', 'Email necesar');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/proforme/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedProformaId, to_email: emailTo }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', 'Email trimis cu succes!');
        setShowEmailModal(false);
        setSelectedProformaId(null);
        setEmailTo('');
        loadProforme();
      } else {
        showNotification('error', data.error || 'Eroare la trimiterea email-ului');
      }
    } catch (error) {
      showNotification('error', 'Eroare la trimiterea email-ului');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (id: number) => {
    if (!confirm('Confirmi încasarea acestei proforme?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/proforme/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', 'Proforma confirmată ca plătită!');
        loadProforme();
        loadStats();
      } else {
        showNotification('error', data.error || 'Eroare');
      }
    } catch (error) {
      showNotification('error', 'Eroare');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sigur ștergi această proformă?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/proforme/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', 'Proformă ștearsă!');
        loadProforme();
        loadStats();
      } else {
        showNotification('error', data.error || 'Eroare');
      }
    } catch (error) {
      showNotification('error', 'Eroare');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    const taxRate = taxRates.find(t => t.id === product.tax_rate_id) || taxRates.find(t => t.rate === 21);
    
    setItems([...items, {
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      quantity: 1,
      unit_price: product.price_partner_net,
      tax_rate_id: taxRate?.id || 1,
      tax_rate_value: taxRate?.rate || 21,
    }]);
    setShowProductSearch(false);
    setProductSearchTerm('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof ProformaItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Update tax rate value if tax_rate_id changes
    if (field === 'tax_rate_id') {
      const taxRate = taxRates.find(t => t.id === parseInt(value));
      if (taxRate) {
        newItems[index].tax_rate_value = taxRate.rate;
      }
    }
    
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
    const totalVat = items.reduce((sum, item) => {
      const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0);
      return sum + (itemSubtotal * (item.tax_rate_value || 0) / 100);
    }, 0);
    const total = subtotal + totalVat;

    return { subtotal, totalVat, total };
  };

  const handleCreateProforma = async () => {
    // Validation
    if (!clientData.client_name || !clientData.client_email) {
      showNotification('error', 'Nume și email client sunt obligatorii');
      return;
    }

    if (clientType === 'PJ' && (!clientData.client_cui || !clientData.client_reg_com)) {
      showNotification('error', 'CUI și Reg. Com. sunt obligatorii pentru PJ');
      return;
    }

    if (items.length === 0) {
      showNotification('error', 'Adaugă cel puțin un produs');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/proforme/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_type: clientType,
          ...clientData,
          currency,
          client_notes: clientNotes,
          items,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', `Proformă ${data.data.full_number} creată!`);
        // Reset form
        setClientData({
          client_name: '',
          client_cui: '',
          client_reg_com: '',
          client_phone: '',
          client_email: '',
          client_address: '',
          client_city: '',
          client_county: '',
        });
        setItems([]);
        setClientNotes('');
        setActiveView('list');
      } else {
        showNotification('error', data.error || 'Eroare la creare');
      }
    } catch (error) {
      showNotification('error', 'Eroare la creare');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-blue-50 text-blue-700 ring-blue-200',
      paid: 'bg-green-50 text-green-700 ring-green-200',
      cancelled: 'bg-red-50 text-red-700 ring-red-200',
    };

    const labels = {
      pending: '🔵 În așteptare',
      paid: '🟢 Încasat',
      cancelled: '🔴 Anulat',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ring-1 ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
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
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            {activeView === 'list' ? 'Proforme' : 'Creare Proformă Nouă'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {activeView === 'list' ? 'Gestionează facturile proformă' : 'Completează datele pentru proforma nouă'}
          </p>
        </div>
        <div className="flex gap-3">
          {activeView === 'list' ? (
            <>
              <button
                onClick={() => loadProforme()}
                disabled={loading}
                className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-[10px] hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Reîmprospătează
              </button>
              <button
                onClick={() => setActiveView('create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                data-testid="create-proforma-btn"
              >
                <Plus className="w-4 h-4" />
                Creare Proformă
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveView('list')}
              className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-[10px] hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
            >
              <X className="w-4 h-4" />
              Înapoi la Listă
            </button>
          )}
        </div>
      </div>

      {activeView === 'list' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Total Proforme</div>
              <div className="text-3xl font-bold text-slate-900">{stats.total_proforme}</div>
            </div>
            <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Încasate</div>
              <div className="text-3xl font-bold text-green-600">{stats.total_paid}</div>
            </div>
            <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">În Așteptare</div>
              <div className="text-3xl font-bold text-blue-600">{stats.total_pending}</div>
            </div>
            <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600 mb-1">Sumă Încasată</div>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.suma_incasata?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-4 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Caută client, email, număr..."
                  className="w-full pl-10 pr-3 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="search-proforme"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="filter-status"
            >
              <option value="all">Toate</option>
              <option value="pending">În Așteptare</option>
              <option value="paid">Încasate</option>
              <option value="cancelled">Anulate</option>
            </select>
          </div>

          {/* Proforme Table */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Număr</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Dată</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Sumă</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-900">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-slate-900">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {loading && proforme.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Se încarcă...
                    </td>
                  </tr>
                ) : proforme.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Nu există proforme
                    </td>
                  </tr>
                ) : (
                  proforme.map((proforma, idx) => (
                    <tr
                      key={proforma.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/50' : ''
                      }`}
                      data-testid={`proforma-row-${proforma.id}`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">{proforma.full_number}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(proforma.issue_date).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{proforma.client_name}</div>
                        {proforma.client_email && (
                          <div className="text-sm text-slate-600">{proforma.client_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {proforma.total_with_vat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {proforma.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(proforma.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(proforma.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Descarcă PDF"
                            data-testid={`download-pdf-${proforma.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProformaId(proforma.id);
                              setEmailTo(proforma.client_email || '');
                              setShowEmailModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Trimite Email"
                            data-testid={`send-email-${proforma.id}`}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {proforma.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmPayment(proforma.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Confirmă Încasare"
                              data-testid={`confirm-${proforma.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(proforma.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Șterge"
                            data-testid={`delete-${proforma.id}`}
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
        </>
      ) : (
        /* Create Proforma Form */
        <div className="space-y-6">
          {/* Client Info */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">👤 Date Client</h2>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={clientType === 'PF'}
                  onChange={() => setClientType('PF')}
                  className="w-4 h-4"
                  data-testid="radio-pf"
                />
                <span className="font-medium">Persoană Fizică</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={clientType === 'PJ'}
                  onChange={() => setClientType('PJ')}
                  className="w-4 h-4"
                  data-testid="radio-pj"
                />
                <span className="font-medium">Persoană Juridică</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  {clientType === 'PF' ? 'Nume Complet *' : 'Nume Firmă *'}
                </label>
                <input
                  type="text"
                  value={clientData.client_name}
                  onChange={(e) => setClientData({ ...clientData, client_name: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  data-testid="field-client-name"
                />
              </div>

              {clientType === 'PJ' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">CUI *</label>
                    <input
                      type="text"
                      value={clientData.client_cui}
                      onChange={(e) => setClientData({ ...clientData, client_cui: e.target.value })}
                      className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="field-client-cui"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Reg. Com. *</label>
                    <input
                      type="text"
                      value={clientData.client_reg_com}
                      onChange={(e) => setClientData({ ...clientData, client_reg_com: e.target.value })}
                      className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid="field-client-reg-com"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Telefon</label>
                <input
                  type="text"
                  value={clientData.client_phone}
                  onChange={(e) => setClientData({ ...clientData, client_phone: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="field-client-phone"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Email *</label>
                <input
                  type="email"
                  value={clientData.client_email}
                  onChange={(e) => setClientData({ ...clientData, client_email: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  data-testid="field-client-email"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 mb-2">Adresă</label>
                <input
                  type="text"
                  value={clientData.client_address}
                  onChange={(e) => setClientData({ ...clientData, client_address: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="field-client-address"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Oraș</label>
                <input
                  type="text"
                  value={clientData.client_city}
                  onChange={(e) => setClientData({ ...clientData, client_city: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="field-client-city"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Județ</label>
                <input
                  type="text"
                  value={clientData.client_county}
                  onChange={(e) => setClientData({ ...clientData, client_county: e.target.value })}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="field-client-county"
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">📦 Produse</h2>
              <button
                onClick={() => setShowProductSearch(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                data-testid="add-product-btn"
              >
                <Plus className="w-4 h-4" />
                Adaugă Produs
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nu ai adăugat încă produse
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-sm font-bold">SKU</th>
                      <th className="text-left px-3 py-2 text-sm font-bold">Nume</th>
                      <th className="text-left px-3 py-2 text-sm font-bold">Cant.</th>
                      <th className="text-left px-3 py-2 text-sm font-bold">Preț</th>
                      <th className="text-left px-3 py-2 text-sm font-bold">TVA</th>
                      <th className="text-right px-3 py-2 text-sm font-bold">Total</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="px-3 py-2 text-sm">{item.sku}</td>
                        <td className="px-3 py-2 text-sm">{item.name}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value))}
                            className="w-16 border border-slate-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleUpdateItem(idx, 'unit_price', parseFloat(e.target.value))}
                            className="w-24 border border-slate-300 rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.tax_rate_id}
                            onChange={(e) => handleUpdateItem(idx, 'tax_rate_id', e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-sm"
                          >
                            {taxRates.map(rate => (
                              <option key={rate.id} value={rate.id}>{rate.rate}%</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right font-bold tabular-nums">
                          {(((item.quantity || 0) * (item.unit_price || 0)) * (1 + (item.tax_rate_value || 0) / 100)).toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">💰 Sumar</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal (fără TVA):</span>
                <span className="font-bold tabular-nums">{totals.subtotal.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">TVA:</span>
                <span className="font-bold tabular-nums">{totals.totalVat.toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between text-lg border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-900">TOTAL:</span>
                <span className="font-bold text-blue-600 text-2xl tabular-nums">{totals.total.toFixed(2)} {currency}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Valută</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'RON' | 'EUR')}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  data-testid="field-currency"
                >
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Observații Client</label>
              <textarea
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Observații vizibile pe proformă..."
                data-testid="field-client-notes"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCreateProforma}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold disabled:opacity-50"
                data-testid="create-proforma-submit"
              >
                <FileText className="w-5 h-5" />
                {loading ? 'Se creează...' : 'Creează Proformă'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[10px] max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Trimite Email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Email Destinatar *</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="client@example.com"
                  data-testid="email-to-field"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setSelectedProformaId(null);
                  setEmailTo('');
                }}
                className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-[10px] hover:bg-slate-50 transition-colors font-medium"
              >
                Anulează
              </button>
              <button
                onClick={handleSendEmail}
                disabled={loading || !emailTo}
                className="px-4 py-2 bg-green-600 text-white rounded-[10px] hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                data-testid="send-email-submit"
              >
                {loading ? 'Se trimite...' : 'Trimite Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Search Modal */}
      {showProductSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[10px] max-w-2xl w-full p-6 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Adaugă Produs</h2>
              <button
                onClick={() => {
                  setShowProductSearch(false);
                  setProductSearchTerm('');
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                placeholder="Caută produs după nume sau SKU..."
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                autoFocus
                data-testid="product-search-input"
              />
            </div>

            <div className="space-y-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Nu s-au găsit produse
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    data-testid={`select-product-${product.id}`}
                  >
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-sm text-slate-600">
                      SKU: {product.sku} • Preț: {(product.price_partner_net || 0).toFixed(2)} RON
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
