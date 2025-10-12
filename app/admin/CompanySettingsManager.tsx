'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, RefreshCw, CheckCircle, AlertCircle, Upload } from 'lucide-react';

type CompanySettings = {
  id?: number;
  company_name: string;
  cui: string;
  reg_com: string;
  address: string;
  city: string;
  county: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  iban_ron: string;
  iban_eur: string;
  bank_name: string;
  logo_url: string;
  proforma_series: string;
  proforma_counter: number;
  email_subject_template: string;
  email_body_template: string;
  terms_and_conditions: string;
};

export default function CompanySettingsManager() {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: 'OTKA',
    cui: '',
    reg_com: '',
    address: '',
    city: '',
    county: '',
    postal_code: '',
    country: 'România',
    phone: '',
    email: '',
    website: '',
    iban_ron: '',
    iban_eur: '',
    bank_name: '',
    logo_url: '',
    proforma_series: 'OTK',
    proforma_counter: 0,
    email_subject_template: 'Proforma #{number} - {company_name}',
    email_body_template: 'Bună ziua,\n\nVă transmitem în atașament factura proformă #{number}.\n\nVă mulțumim,\n{company_name}',
    terms_and_conditions: 'Plata se va efectua în termen de 15 zile de la emiterea proformei.\nProdusele rămân proprietatea vânzătorului până la încasarea integrală a sumei.',
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const loadSettings = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/company-settings/get', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error: any) {
      showNotification('error', 'Eroare la încărcarea setărilor');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/company-settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        showNotification('success', 'Setări actualizate cu succes!');
        setSettings(data.data);
      } else {
        showNotification('error', data.error || 'Eroare la salvare');
      }
    } catch (error: any) {
      showNotification('error', 'Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            Setări Companie
          </h1>
          <p className="text-sm text-slate-600 mt-1">Configurează datele firmei pentru proforme</p>
        </div>
        <button
          onClick={loadSettings}
          disabled={loading}
          className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-[10px] hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Reîmprospătează
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Firmă */}
        <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">📋 Date Firmă</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Nume Companie *</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                data-testid="field-company-name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">CUI</label>
              <input
                type="text"
                value={settings.cui}
                onChange={(e) => setSettings({ ...settings, cui: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="RO12345678"
                data-testid="field-cui"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Reg. Com.</label>
              <input
                type="text"
                value={settings.reg_com}
                onChange={(e) => setSettings({ ...settings, reg_com: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="J40/1234/2020"
                data-testid="field-reg-com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Telefon</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+40 123 456 789"
                data-testid="field-phone"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@otka.ro"
                data-testid="field-email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Website</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://otka.ro"
                data-testid="field-website"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Adresă Completă</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Str. Exemplu Nr. 1"
              data-testid="field-address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Oraș</label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="București"
                data-testid="field-city"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Județ</label>
              <input
                type="text"
                value={settings.county}
                onChange={(e) => setSettings({ ...settings, county: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="București"
                data-testid="field-county"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Cod Poștal</label>
              <input
                type="text"
                value={settings.postal_code}
                onChange={(e) => setSettings({ ...settings, postal_code: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="010101"
                data-testid="field-postal-code"
              />
            </div>
          </div>
        </div>

        {/* Date Bancare */}
        <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">🏦 Date Bancare</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Nume Bancă</label>
            <input
              type="text"
              value={settings.bank_name}
              onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Banca Transilvania"
              data-testid="field-bank-name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">IBAN RON</label>
              <input
                type="text"
                value={settings.iban_ron}
                onChange={(e) => setSettings({ ...settings, iban_ron: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="RO49AAAA1B31007593840000"
                data-testid="field-iban-ron"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">IBAN EUR</label>
              <input
                type="text"
                value={settings.iban_eur}
                onChange={(e) => setSettings({ ...settings, iban_eur: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="RO49AAAA1B31007593840001"
                data-testid="field-iban-eur"
              />
            </div>
          </div>
        </div>

        {/* Setări Proforme */}
        <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">🧾 Setări Proforme</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Serie Proforme</label>
              <input
                type="text"
                value={settings.proforma_series}
                onChange={(e) => setSettings({ ...settings, proforma_series: e.target.value })}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="OTK"
                data-testid="field-series"
              />
              <p className="text-xs text-slate-600 mt-1">Ex: OTK-00001</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Counter Curent (readonly)</label>
              <input
                type="number"
                value={settings.proforma_counter}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 bg-slate-100 cursor-not-allowed"
                disabled
                data-testid="field-counter"
              />
              <p className="text-xs text-slate-600 mt-1">Numărul următoarei proforme</p>
            </div>
          </div>
        </div>

        {/* Template-uri Email */}
        <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">📧 Template-uri Email</h2>
          <p className="text-sm text-slate-600">Folosește variabilele: <code className="bg-slate-100 px-2 py-1 rounded text-xs">{'{number}'}</code>, <code className="bg-slate-100 px-2 py-1 rounded text-xs">{'{company_name}'}</code></p>
          
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Subiect Email</label>
            <input
              type="text"
              value={settings.email_subject_template}
              onChange={(e) => setSettings({ ...settings, email_subject_template: e.target.value })}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="field-email-subject"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Corp Email</label>
            <textarea
              value={settings.email_body_template}
              onChange={(e) => setSettings({ ...settings, email_body_template: e.target.value })}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              data-testid="field-email-body"
            />
          </div>
        </div>

        {/* Termeni și Condiții */}
        <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">📜 Termeni și Condiții</h2>
          
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Text pentru PDF Proformă</label>
            <textarea
              value={settings.terms_and_conditions}
              onChange={(e) => setSettings({ ...settings, terms_and_conditions: e.target.value })}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              data-testid="field-terms"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-[10px] hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold text-lg disabled:opacity-50"
            data-testid="save-settings-btn"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Se salvează...' : 'Salvează Setări'}
          </button>
        </div>
      </form>
    </div>
  );
}
