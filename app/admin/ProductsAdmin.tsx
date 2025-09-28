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
    price_original: '',
    price_partner_net: '',
    stock_qty: '',
    description: '',
    gallery: [] as string[]
  });
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products/list', { cache: 'no-store' });
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

  const uploadImages = async (files: FileList): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
      
      const data = await res.json();
      uploadedUrls.push(data.url);
    }
    
    return uploadedUrls;
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let galleryUrls = [...newProduct.gallery];
      
      // Upload new images if any
      if (imageFiles && imageFiles.length > 0) {
        const uploadedUrls = await uploadImages(imageFiles);
        galleryUrls = [...galleryUrls, ...uploadedUrls];
      }

      const productData = {
        sku: newProduct.sku,
        name: newProduct.name,
        price_public_ttc: parseFloat(newProduct.price_public_ttc) || 0,
        price_partner_net: parseFloat(newProduct.price_partner_net) || 0,
        stock_qty: parseInt(newProduct.stock_qty) || 0,
        gallery: galleryUrls,
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
        sku: '', name: '', price_public_ttc: '', price_original: '', price_partner_net: '',
        stock_qty: '', description: '', gallery: []
      });
      setImageFiles(null);
      await loadProducts();
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
      await loadProducts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    toast.info('Funcția de editare va fi disponibilă în curând');
  };

  const handleDeleteProduct = async (productId: number) => {
    toast.info('Funcția de ștergere va fi disponibilă în curând');
  };

  return (
    <div className="space-y-6" data-testid="products-admin">
      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b-2 border-neutral-400" data-testid="products-admin-tabs">
        <button
          onClick={() => setActiveView('list')}
          data-testid="products-tab-list"
          className={`pb-2 px-3 text-sm font-extrabold border-b-2 transition-colors ${
            activeView === 'list'
              ? 'border-blue-600 text-blue-900'
              : 'border-transparent text-neutral-800 hover:text-neutral-950'
          }`}
        >
          📋 Lista Produse ({products.length})
        </button>
        <button
          onClick={() => setActiveView('add')}
          data-testid="products-tab-add"
          className={`pb-2 px-3 text-sm font-extrabold border-b-2 transition-colors ${
            activeView === 'add'
              ? 'border-blue-600 text-blue-900'
              : 'border-transparent text-neutral-800 hover:text-neutral-950'
          }`}
        >
          ➕ Adaugă Produs
        </button>
        <button
          onClick={() => setActiveView('import')}
          data-testid="products-tab-import"
          className={`pb-2 px-3 text-sm font-extrabold border-b-2 transition-colors ${
            activeView === 'import'
              ? 'border-blue-600 text-blue-900'
              : 'border-transparent text-neutral-800 hover:text-neutral-950'
          }`}
        >
          📁 Import CSV
        </button>
      </div>

      {/* List View */}
      {activeView === 'list' && (
        <div className="bg-white rounded-xl border-2 border-neutral-500 shadow-sm" data-testid="products-list-card">
          <div className="p-6 border-b-2 border-neutral-400">
            <h3 className="text-lg font-extrabold text-neutral-950">Produse Existente</h3>
            <p className="text-sm font-semibold text-neutral-800">Gestionează catalodul de produse pentru shop-ul public și parteneri</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-300" data-testid="products-table">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
                    Produs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
                    Preț Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
                    Preț Partener
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
                    Stoc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-neutral-700" data-testid="products-loading">Se încarcă...</td>
                  </tr>
                )}
                {!loading && products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50" data-testid={`product-row-${product.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.gallery && product.gallery[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={product.gallery[0]}
                            alt={product.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-extrabold text-neutral-950">{product.name}</div>
                          <div className="text-sm font-semibold text-neutral-800">/{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-neutral-950">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-neutral-950">
                      {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(product.price_public_ttc)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-neutral-950">
                      {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(product.price_partner_net)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-extrabold rounded-full ${
                        product.stock_qty > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock_qty} buc
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-700 hover:text-blue-900 mr-3 font-bold" 
                        data-testid={`product-edit-${product.id}`}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-700 hover:text-red-900 font-bold" 
                        data-testid={`product-delete-${product.id}`}
                      >
                        🗑️ Șterge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-neutral-700 text-4xl mb-2">📦</div>
                <p className="text-neutral-900 font-extrabold">Nu există produse în catalog</p>
                <button 
                  onClick={() => setActiveView('add')}
                  data-testid="add-first-product"
                  className="mt-2 text-blue-800 hover:text-blue-900 font-extrabold underline"
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
        <div className="bg-white rounded-xl border-2 border-neutral-400 p-6" data-testid="add-product-card">
          <div className="mb-6">
            <h3 className="text-lg font-extrabold text-neutral-950">Adaugă Produs Nou</h3>
            <p className="text-sm text-neutral-800 font-semibold">Completează informațiile pentru un produs nou</p>
          </div>

          <form onSubmit={addProduct} className="space-y-6" data-testid="add-product-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  SKU (Cod Produs) *
                </label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: OTKA-001, IPHONE14-128GB"
                  required
                  data-testid="field-sku"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Nume Produs *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: iPhone 14 128GB Blue"
                  required
                  data-testid="field-name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Preț de Listă (tăiat)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price_original}
                  onChange={(e) => setNewProduct({...newProduct, price_original: e.target.value})}
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  data-testid="field-price-original"
                />
                <p className="text-xs text-neutral-600 mt-1">Prețul tăiat care va fi afișat pe site (opțional)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Preț de Vânzare (cu TVA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price_public_ttc}
                  onChange={(e) => setNewProduct({...newProduct, price_public_ttc: e.target.value})}
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                  data-testid="field-price-public"
                />
                <p className="text-xs text-neutral-600 mt-1">Prețul final de vânzare care va fi afișat pe site</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Preț Partener (fără TVA) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price_partner_net}
                  onChange={(e) => setNewProduct({...newProduct, price_partner_net: e.target.value})}
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                  data-testid="field-price-partner"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Stoc Disponibil *
                </label>
                <input
                  type="number"
                  value={newProduct.stock_qty}
                  onChange={(e) => setNewProduct({...newProduct, stock_qty: e.target.value})}
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  required
                  data-testid="field-stock"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Imagini Produs
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="field-images"
                />
                <p className="text-xs text-neutral-600 mt-1">
                  Selectează una sau mai multe imagini. Prima imagine va fi imaginea principală.
                </p>
                {imageFiles && imageFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-700">
                      {imageFiles.length} imagine(i) selectate:
                    </p>
                    <ul className="text-xs text-neutral-600 mt-1">
                      {Array.from(imageFiles).map((file, i) => (
                        <li key={i}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Descriere Produs
              </label>
              <textarea
                rows={4}
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrierea detaliată a produsului..."
                data-testid="field-description"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-4 py-2 border-2 border-neutral-500 rounded-lg text-neutral-900 hover:bg-neutral-50 font-bold"
                disabled={loading}
                data-testid="cancel-add-product"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 font-extrabold"
                disabled={loading}
                data-testid="submit-add-product"
              >
                {loading ? 'Se salvează...' : 'Salvează Produs'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import View */}
      {activeView === 'import' && (
        <div className="space-y-6" data-testid="import-products-card">
          <div className="bg-white rounded-xl border-2 border-neutral-400 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-neutral-950">Import Produse din CSV</h3>
              <p className="text-sm text-neutral-800 font-semibold">Încarcă produse în masă folosind un fișier CSV</p>
            </div>

            <form onSubmit={handleCSVUpload} className="space-y-4" data-testid="import-products-form">
              <div>
                <label className="block text-sm font-bold text-neutral-900 mb-2">
                  Selectează fișierul CSV
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".csv"
                  className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  data-testid="field-csv"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 text-white rounded-lg py-3 hover:bg-blue-800 disabled:opacity-50 font-extrabold"
                disabled={loading}
                data-testid="submit-import-products"
              >
                {loading ? 'Se importă...' : '📁 Importă Produse din CSV'}
              </button>
            </form>
          </div>

          {/* CSV Format Documentation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-extrabold text-blue-900 mb-4">📋 Format CSV Necesar</h4>
            
            <div className="mb-4">
              <p className="text-sm text-blue-800 mb-2 font-semibold">
                Fișierul CSV trebuie să conțină următoarele coloane (în această ordine):
              </p>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <code className="text-sm text-neutral-900">
                  sku,name,price_public_ttc,price_partner_net,stock_qty,gallery,description
                </code>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-extrabold text-blue-900 mb-2">Explicația coloanelor:</h5>
                <ul className="space-y-1 text-blue-800 font-semibold">
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
                <h5 className="font-extrabold text-blue-900 mb-2">Exemplu de rând CSV:</h5>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <code className="text-xs text-neutral-900 break-all">
                    IPHONE14-128,iPhone 14 128GB Blue,4999.99,4199.99,50,https://cdn.otka.ro/iphone14.jpg,Smartphone Apple cu ecran de 6.1 inch
                  </code>
                </div>
                
                <div className="mt-3">
                  <h6 className="font-bold text-blue-900 mb-1">📝 Template CSV:</h6>
                  <a 
                    href="/templates/products-template.csv" 
                    className="text-blue-700 hover:text-blue-900 underline text-sm font-extrabold"
                    download
                    data-testid="download-template-csv"
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