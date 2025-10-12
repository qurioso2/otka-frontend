'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import GalleryManager from '@/components/GalleryManager';
import RichTextEditor from '@/components/RichTextEditor';

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
  category?: string;
  tax_rate_id?: number;
};

type TaxRate = {
  id: number;
  name: string;
  rate: number;
  active: boolean;
  is_default: boolean;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};

type Brand = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
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
    summary: '',
    category: '',
    brand_id: '',
    tax_rate_id: '',
    gallery: [] as string[]
  });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewBrandForm, setShowNewBrandForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  // imageFiles removed - gallery managed by GalleryManager component
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

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTaxRates = async () => {
    try {
      const res = await fetch('/api/admin/tax-rates/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load tax rates');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTaxRates(data.data);
      }
    } catch (error: any) {
      console.error('Error loading tax rates:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Introduceți un nume pentru categorie');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create category');
      }

      const data = await res.json();
      toast.success('Categorie adăugată cu succes!');
      setNewCategoryName('');
      setShowNewCategoryForm(false);
      await loadCategories();
      
      // Set the newly created category as selected
      if (data.category) {
        setNewProduct({...newProduct, category: data.category.name});
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const loadBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load brands');
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error loading brands:', error);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Introduceți un nume pentru brand');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/brands/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create brand');
      }

      const data = await res.json();
      toast.success('Brand adăugat cu succes!');
      setNewBrandName('');
      setShowNewBrandForm(false);
      await loadBrands();
      
      // Set the newly created brand as selected
      if (data.brand) {
        setNewProduct({...newProduct, brand_id: data.brand.id.toString()});
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
    loadTaxRates();
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
      // 1. Generează slug din numele produsului
      const generateSlug = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // elimină caractere speciale
          .trim()
          .replace(/\s+/g, '-') // înlocuiește spațiile cu -
          .replace(/-+/g, '-'); // elimină - multiple
      };

      // Gallery is already managed by GalleryManager - uploaded URLs are in newProduct.gallery
      const galleryUrls: string[] = [...newProduct.gallery];

      // 3. Validare și conversie tipuri de date
      const price_public_ttc = parseFloat(newProduct.price_public_ttc);
      const price_partner_net = parseFloat(newProduct.price_partner_net) || 0;
      const stock_qty = parseInt(newProduct.stock_qty) || 0;

      // Validare prețuri
      if (isNaN(price_public_ttc) || price_public_ttc <= 0) {
        throw new Error('Prețul public trebuie să fie un număr valid mai mare ca 0');
      }
      if (isNaN(price_partner_net) || price_partner_net < 0) {
        throw new Error('Prețul partener trebuie să fie un număr valid >= 0');
      }
      if (stock_qty < 0) {
        throw new Error('Stocul trebuie să fie un număr >= 0');
      }

      // 4. Pregătește datele cu tipurile corecte
      const productData = {
        sku: newProduct.sku.trim(),
        name: newProduct.name.trim(),
        slug: generateSlug(newProduct.name),
        price_public_ttc: price_public_ttc,
        price_partner_net: price_partner_net,
        stock_qty: stock_qty,
        gallery: galleryUrls,
        description: newProduct.description?.trim() || null,
        summary: newProduct.summary?.trim() || null,
        category: newProduct.category?.trim() || null,
        brand_id: newProduct.brand_id ? parseInt(newProduct.brand_id) : null,
        tax_rate_id: newProduct.tax_rate_id ? parseInt(newProduct.tax_rate_id) : null,
        // Adaugă price_original dacă este setat
        ...(newProduct.price_original && {
          price_original: parseFloat(newProduct.price_original)
        })
      };

      console.log('Trimitere date produs:', productData); // Pentru debug

      // Determine if we're editing or creating
      const isEditing = editingProduct !== null;
      const apiEndpoint = isEditing ? '/api/admin/products/update' : '/api/admin/products/create';
      const requestData = isEditing ? { id: editingProduct.id, ...productData } : productData;

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error('Eroare API:', data);
        throw new Error(data.error || `Eroare ${res.status}: ${data.message || 'Failed to save product'}`);
      }

      toast.success(isEditing ? 'Produs actualizat cu succes!' : 'Produs adăugat cu succes!');
      
      // Reset form
      setNewProduct({
        sku: '', 
        name: '', 
        price_public_ttc: '', 
        price_original: '', 
        price_partner_net: '',
        stock_qty: '', 
        description: '',
        summary: '',
        category: '',
        brand_id: '',
        tax_rate_id: '',
        gallery: []
      });
      // imageFiles state removed
      setEditingProduct(null);
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      setShowNewBrandForm(false);
      setNewBrandName('');
      
      await loadProducts();
      setActiveView('list');
      
    } catch (error: any) {
      console.error('Eroare salvare produs:', error);
      toast.error(error.message || 'Eroare necunoscută la salvarea produsului');
    } finally {
      setLoading(false);
    }
  };

  // Funcție helper pentru validarea formularului
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!newProduct.sku.trim()) errors.push('SKU este obligatoriu');
    if (!newProduct.name.trim()) errors.push('Numele produsului este obligatoriu');
    if (!newProduct.price_public_ttc) errors.push('Prețul public este obligatoriu');
    
    const price = parseFloat(newProduct.price_public_ttc);
    if (isNaN(price) || price <= 0) errors.push('Prețul public trebuie să fie un număr valid > 0');
    
    return errors;
  };

  // Actualizează handleSubmit să folosească validarea
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(`Erori de validare:\n${errors.join('\n')}`);
      return;
    }
    
    addProduct(e);
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
    setEditingProduct(product);
    setNewProduct({
      sku: product.sku,
      name: product.name,
      price_public_ttc: product.price_public_ttc.toString(),
      price_original: (product as any).price_original?.toString() || '',
      price_partner_net: product.price_partner_net.toString(),
      stock_qty: product.stock_qty.toString(),
      description: product.description || '',
      summary: (product as any).summary || '',
      category: product.category || '',
      brand_id: (product as any).brand_id?.toString() || '',
      tax_rate_id: (product as any).tax_rate_id?.toString() || '',
      gallery: product.gallery || []
    });
    setActiveView('add');
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Sigur doriți să ștergeți acest produs?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      toast.success('Produs șters cu succes!');
      await loadProducts();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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
            <h3 className="text-lg font-extrabold text-neutral-950">
              {editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}
            </h3>
            <p className="text-sm text-neutral-800 font-semibold">
              {editingProduct ? 'Modifică informațiile produsului' : 'Completează informațiile pentru un produs nou'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="add-product-form">
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

            </div>

            {/* Category Field */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Categorie
              </label>
              <div className="flex gap-2">
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="flex-1 border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="field-category"
                >
                  <option value="">-- Fără categorie --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold whitespace-nowrap"
                  data-testid="toggle-new-category"
                >
                  {showNewCategoryForm ? 'Anulează' : '+ Nouă'}
                </button>
              </div>
              
              {showNewCategoryForm && (
                <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    Nume categorie nouă
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="ex: Canapele, Mese, etc."
                      data-testid="field-new-category-name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                      data-testid="submit-new-category"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Brand Field */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Brand / Producător
              </label>
              <div className="flex gap-2">
                <select
                  value={newProduct.brand_id}
                  onChange={(e) => setNewProduct({...newProduct, brand_id: e.target.value})}
                  className="flex-1 border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="field-brand"
                >
                  <option value="">-- Fără brand --</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewBrandForm(!showNewBrandForm)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold whitespace-nowrap"
                  data-testid="toggle-new-brand"
                >
                  {showNewBrandForm ? 'Anulează' : '+ Nou'}
                </button>
              </div>
              
              {showNewBrandForm && (
                <div className="mt-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <label className="block text-sm font-bold text-neutral-900 mb-2">
                    Nume brand nou
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="flex-1 border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="ex: Pianca, Lago, etc."
                      data-testid="field-new-brand-name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBrand();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddBrand}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
                      data-testid="submit-new-brand"
                    >
                      Adaugă
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary Field */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Rezumat Scurt (Summary)
              </label>
              <textarea
                value={newProduct.summary}
                onChange={(e) => setNewProduct({...newProduct, summary: e.target.value})}
                className="w-full border-2 border-neutral-500 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Scurt rezumat afișat în cardul produsului (2-3 propoziții)"
                rows={2}
                data-testid="field-summary"
              />
              <p className="text-xs text-neutral-600 mt-1">
                Rezumatul va fi afișat în preview-ul produsului
              </p>
            </div>

            {/* Description Field - Rich Text Editor */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Descriere Completă (Rich Text)
              </label>
              <RichTextEditor
                value={newProduct.description}
                onChange={(html) => setNewProduct({...newProduct, description: html})}
                placeholder="Descriere detaliată cu formatare: bold, italic, liste, headings..."
              />
              <p className="text-xs text-neutral-600 mt-1">
                Folosește toolbar-ul pentru formatare. Descrierea va fi afișată pe pagina produsului.
              </p>
            </div>

            {/* Gallery Manager */}
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Galerie Imagini
              </label>
              <GalleryManager
                images={newProduct.gallery}
                onChange={(gallery) => setNewProduct({...newProduct, gallery})}
                onUpload={async (files) => {
                  const uploadedUrls = await uploadImages(files);
                  return uploadedUrls;
                }}
                maxImages={10}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setActiveView('list');
                  setEditingProduct(null);
                  setNewProduct({
                    sku: '', 
                    name: '', 
                    price_public_ttc: '', 
                    price_original: '', 
                    price_partner_net: '',
                    stock_qty: '', 
                    description: '',
                    summary: '',
                    category: '',
                    brand_id: '',
                    gallery: []
                  });
                  setShowNewCategoryForm(false);
                  setNewCategoryName('');
                  setShowNewBrandForm(false);
                  setNewBrandName('');
                  // imageFiles state removed
                }}
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
                {loading ? 'Se salvează...' : (editingProduct ? 'Actualizează Produs' : 'Salvează Produs')}
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