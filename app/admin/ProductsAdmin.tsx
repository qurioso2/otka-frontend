'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type Product = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price_public_ttc: number;
  price_partner_net: number;
  stock_qty: number;
  gallery: string[];
  description?: string;
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'add' | 'import'>('list');
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    price_public_ttc: '',
    price_partner_net: '',
    stock_qty: '',
    description: '',
    gallery: ''
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products/list');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load products');
      setProducts(data.products || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        ...newProduct,
        price_public_ttc: parseFloat(newProduct.price_public_ttc) || 0,
        price_partner_net: parseFloat(newProduct.price_partner_net) || 0,
        stock_qty: parseInt(newProduct.stock_qty) || 0,
        gallery: newProduct.gallery ? [newProduct.gallery] : [],
        slug: newProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };

      const res = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      toast.success('Produs adăugat cu succes!');
      setNewProduct({
        sku: '', name: '', price_public_ttc: '', price_partner_net: '',
        stock_qty: '', description: '', gallery: ''
      });
      loadProducts();
      setActiveView('list');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import CSV');

      toast.success(`Import reușit! ${data.imported || 0} produse adăugate.`);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveView('list')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeView === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Lista Produse ({products.length})
        </button>
        <button
          onClick={() => setActiveView('add')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeView === 'add'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ➕ Adaugă Produs
        </button>
        <button
          onClick={() => setActiveView('import')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeView === 'import'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📁 Import CSV
        </button>
      </div>

      {/* List View */}
      {activeView === 'list' && (
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm">
          <div className="p-6 border-b border-gray-300">
            <h3 className="text-lg font-bold text-gray-900">Produse Existente</h3>
            <p className="text-sm font-medium text-gray-700">Gestionează catalodul de produse pentru shop-ul public și parteneri</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Produs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Preț Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Preț Partener
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Stoc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.gallery && product.gallery[0] && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={product.gallery[0]}
                            alt={product.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900">{product.name}</div>
                          <div className="text-sm font-medium text-gray-700">/{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(product.price_public_ttc)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(product.price_partner_net)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock_qty > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_qty} buc
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        ✏️ Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        🗑️ Șterge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-600 text-4xl mb-2">📦</div>
                <p className="text-gray-800 font-medium">Nu există produse în catalog</p>
                <button 
                  onClick={() => setActiveView('add')}
                  className="mt-2 text-blue-700 hover:text-blue-900 font-bold underline"
                >
                  Adaugă primul produs
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product View */}
      {activeView === 'add' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Adaugă Produs Nou</h3>
            <p className="text-sm text-gray-600">Completează informațiile pentru un produs nou</p>
          </div>

          <form onSubmit={addProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Cod Produs) *
                </label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: OTKA-001, IPHONE14-128GB"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume Produs *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: iPhone 14 128GB Blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preț Public (cu TVA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price_public_ttc}
                  onChange={(e) => setNewProduct({...newProduct, price_public_ttc: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preț Partener (fără TVA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price_partner_net}
                  onChange={(e) => setNewProduct({...newProduct, price_partner_net: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stoc Disponibil *
                </label>
                <input
                  type="number"
                  value={newProduct.stock_qty}
                  onChange={(e) => setNewProduct({...newProduct, stock_qty: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Imagine Principală
                </label>
                <input
                  type="url"
                  value={newProduct.gallery}
                  onChange={(e) => setNewProduct({...newProduct, gallery: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://cdn.otka.ro/images/produs.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descriere Produs
              </label>
              <textarea
                rows={4}
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrierea detaliată a produsului..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Se salvează...' : 'Salvează Produs'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import View */}
      {activeView === 'import' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Import Produse din CSV</h3>
              <p className="text-sm text-gray-600">Încarcă produse în masă folosind un fișier CSV</p>
            </div>

            <form onSubmit={handleCSVUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selectează fișierul CSV
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".csv"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 disabled:opacity-50 font-medium"
                disabled={loading}
              >
                {loading ? 'Se importă...' : '📁 Importă Produse din CSV'}
              </button>
            </form>
          </div>

          {/* CSV Format Documentation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">📋 Format CSV Necesar</h4>
            
            <div className="mb-4">
              <p className="text-sm text-blue-800 mb-2">
                Fișierul CSV trebuie să conțină următoarele coloane (în această ordine):
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <code className="text-sm text-gray-800">
                  sku,name,price_public_ttc,price_partner_net,stock_qty,gallery,description
                </code>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-semibold text-blue-900 mb-2">Explicația coloanelor:</h5>
                <ul className="space-y-1 text-blue-800">
                  <li><strong>sku:</strong> Cod unic produs (obligatoriu)</li>
                  <li><strong>name:</strong> Numele produsului (obligatoriu)</li>
                  <li><strong>price_public_ttc:</strong> Preț public cu TVA</li>
                  <li><strong>price_partner_net:</strong> Preț partener fără TVA</li>
                  <li><strong>stock_qty:</strong> Cantitatea în stoc</li>
                  <li><strong>gallery:</strong> URL imagine (opțional)</li>
                  <li><strong>description:</strong> Descriere (opțional)</li>
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-blue-900 mb-2">Exemplu de rând CSV:</h5>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <code className="text-xs text-gray-700 break-all">
                    IPHONE14-128,iPhone 14 128GB Blue,4999.99,4199.99,50,https://cdn.otka.ro/iphone14.jpg,Smartphone Apple cu ecran de 6.1 inch
                  </code>
                </div>
                
                <div className="mt-3">
                  <h6 className="font-medium text-blue-900 mb-1">📝 Template CSV:</h6>
                  <a 
                    href="/templates/products-template.csv" 
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                    download
                  >
                    Descarcă template CSV →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}