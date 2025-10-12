'use client';
import { useEffect, useState } from 'react';
import { useCart } from '../ui/cart/CartProvider';
import { toast } from 'sonner';
import { Mail, Check } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [clientType, setClientType] = useState<'individual' | 'company'>('individual');
  const [sameAddress, setSameAddress] = useState(true);
  const [result, setResult] = useState<{ id?: number; number?: string; email?: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { /* noop */ }, [items, result]);

  const handleSubmit = async (formData: FormData): Promise<void> => {
    if (items.length === 0) { 
      toast.error('Coșul este gol'); 
      return; 
    }

    setLoading(true);
    try {
      const body = {
        clientType,
        clientName: String(formData.get('name') || ''),
        companyName: String(formData.get('companyName') || ''),
        regCom: String(formData.get('regcom') || ''),
        clientCIF: String(formData.get('cif') || ''),
        billingAddress: String(formData.get('billingAddress') || ''),
        billingCity: String(formData.get('billingCity') || ''),
        billingCounty: String(formData.get('billingCounty') || ''),
        shippingAddress: sameAddress ? String(formData.get('billingAddress') || '') : String(formData.get('shippingAddress') || ''),
        shippingCity: sameAddress ? String(formData.get('billingCity') || '') : String(formData.get('shippingCity') || ''),
        shippingCounty: sameAddress ? String(formData.get('billingCounty') || '') : String(formData.get('shippingCounty') || ''),
        sameAddress,
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        products: items.map(i => ({ 
          name: i.name, 
          sku: i.sku, 
          quantity: i.qty, 
          price: i.price 
        })),
      };

      const res = await fetch('/api/internal/proforme/create-simple', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Eroare la generarea proformei');
      }

      setResult({ 
        id: data.proforma.id,
        number: data.proforma.number, 
        email: data.proforma.email 
      });

      toast.success('Proforma generată cu succes!');
      clear();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Eroare la generare proforma';
      toast.error(msg);
      console.error('Checkout error:', e);
    } finally { 
      setLoading(false); 
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await handleSubmit(fd);
  };

  const sendEmail = async () => {
    if (!result || !result.id) {
      toast.error('Nu există proforma pentru trimitere');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/proforme/send-email', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          id: result.id,
          email: result.email 
        }) 
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Eroare la trimiterea emailului');
      }

      toast.success('Proforma a fost trimisă pe email cu succes!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Eroare la trimiterea emailului';
      toast.error(msg);
      console.error('Email send error:', e);
    } finally { 
      setSending(false); 
    }
  };

  const downloadPDF = async () => {
    if (!result || !result.id) {
      toast.error('Nu există proforma pentru descărcare');
      return;
    }

    try {
      const res = await fetch('/api/admin/proforme/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id }),
      });

      if (!res.ok) {
        throw new Error('Eroare la generarea PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Proforma-${result.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF descărcat cu succes!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Eroare la descărcarea PDF';
      toast.error(msg);
      console.error('PDF download error:', e);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Finalizare comandă</h1>
      <p className="text-neutral-600 mb-6">Completează datele pentru a genera proforma</p>

      {!result && (
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Client Type Selection */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Tip client</h2>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="clientType" 
                  value="individual" 
                  checked={clientType==='individual'} 
                  onChange={() => setClientType('individual')} 
                  className="w-4 h-4"
                /> 
                Persoană fizică
              </label>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="clientType" 
                  value="company" 
                  checked={clientType==='company'} 
                  onChange={() => setClientType('company')} 
                  className="w-4 h-4"
                /> 
                Companie
              </label>
            </div>
          </div>

          {/* Company Details */}
          {clientType==='company' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Date companie</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Denumire companie <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="companyName" 
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                    required={clientType==='company'} 
                    placeholder="SC EXEMPLU SRL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    CIF <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="cif" 
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                    required={clientType==='company'} 
                    placeholder="RO12345678"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Reg. Com.
                  </label>
                  <input 
                    name="regcom" 
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                    placeholder="J40/1234/2020"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Details */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Date contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nume complet <span className="text-red-500">*</span>
                </label>
                <input 
                  name="name" 
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                  required 
                  placeholder="Ion Popescu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input 
                  name="email" 
                  type="email" 
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                  required 
                  placeholder="email@exemplu.ro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input 
                  name="phone" 
                  type="tel" 
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                  required 
                  placeholder="+40 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Adresă facturare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Adresă <span className="text-red-500">*</span>
                </label>
                <input 
                  name="billingAddress" 
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                  required 
                  placeholder="Str. Exemplu, Nr. 10, Bl. A, Sc. 1, Ap. 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Oraș <span className="text-red-500">*</span>
                </label>
                <input 
                  name="billingCity" 
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                  required 
                  placeholder="București"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Județ <span className="text-red-500">*</span>
                </label>
                <input 
                  name="billingCounty" 
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                  required 
                  placeholder="București"
                />
              </div>
            </div>
          </div>

          {/* Same Address Checkbox */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={sameAddress} 
                onChange={(e) => setSameAddress(e.target.checked)} 
                className="w-5 h-5 rounded border-neutral-300 text-black focus:ring-2 focus:ring-black"
              />
              <span className="text-sm font-medium text-neutral-700">
                Adresa de livrare este aceeași cu adresa de facturare
              </span>
            </label>
          </div>

          {/* Shipping Address */}
          {!sameAddress && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Adresă livrare</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Adresă <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="shippingAddress" 
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                    required={!sameAddress} 
                    placeholder="Str. Livrare, Nr. 20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Oraș <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="shippingCity" 
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                    required={!sameAddress} 
                    placeholder="Cluj-Napoca"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Județ <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="shippingCounty" 
                    className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black" 
                    required={!sameAddress} 
                    placeholder="Cluj"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Sumar comandă</h2>
            <div className="space-y-2 mb-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-neutral-600">
                    {item.name} × {item.qty}
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Total</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(total)}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || items.length === 0} 
            className="w-full rounded-full bg-black text-white px-6 py-3.5 text-base font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Se procesează...' : 'Generează proformă'}
          </button>
        </form>
      )}

      {/* Success Message */}
      {result && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-emerald-900">Proforma generată cu succes!</h2>
              <p className="text-sm text-emerald-700">Număr: {result.number}</p>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-800">
              Proforma a fost creată și salvată în sistem. Poți descărca PDF-ul sau trimite proforma pe email.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={sendEmail} 
              disabled={sending} 
              className="flex-1 rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {sending ? 'Se trimite...' : `Trimite pe email (${result.email})`}
            </button>
            <button 
              onClick={downloadPDF} 
              className="flex-1 rounded-full border-2 border-black text-black px-6 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Descarcă PDF
            </button>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-sm text-neutral-600 hover:text-black underline"
            >
              Înapoi la pagina principală
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
