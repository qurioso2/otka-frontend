'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import ProductImage from './ProductImage';
import ShareButtons from '@/components/ShareButtons';
import { Search, X } from 'lucide-react';

interface ProductPublic {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price_public_ttc: number;
  price_original?: number;
  stock_qty: number;
  gallery: unknown[] | null;
  category?: string;
  brand_name?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export default function ProductsInfinite({ initialRows }: { initialRows: ProductPublic[] }) {
  const [rows, setRows] = useState<ProductPublic[]>(initialRows);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'brand'>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialRows.length);
  const [itemsPerPage, setItemsPerPage] = useState(18);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/public/categories', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await fetch('/api/public/brands', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setBrands(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error loading brands:', error);
      }
    };
    loadBrands();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  // Reload products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
        const brandParam = selectedBrand !== 'all' ? `&brand=${encodeURIComponent(selectedBrand)}` : '';
        const sortParam = sortBy !== 'default' ? `&sort=${sortBy}` : '';
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        const res = await fetch(`/api/public/products?offset=0&limit=${itemsPerPage}${categoryParam}${brandParam}${sortParam}${searchParam}`, { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) {
          setRows(data);
          setOffset(data.length);
          setHasMore(data.length >= itemsPerPage);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory, selectedBrand, sortBy, searchQuery, itemsPerPage]);

  // Infinite scroll
  useEffect(() => {
    const io = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setLoading(true);
        try {
          const categoryParam = selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
          const brandParam = selectedBrand !== 'all' ? `&brand=${encodeURIComponent(selectedBrand)}` : '';
          const sortParam = sortBy !== 'default' ? `&sort=${sortBy}` : '';
          const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
          const res = await fetch(`/api/public/products?offset=${offset}&limit=${itemsPerPage}${categoryParam}${brandParam}${sortParam}${searchParam}`, { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            setRows((prev) => [...prev, ...data]);
            setOffset((o) => o + data.length);
            if (data.length < itemsPerPage) {
              setHasMore(false);
            }
          } else {
            setHasMore(false);
          }
        } catch {}
        finally { setLoading(false); }
      }
    }, { threshold: 0.2 });
    if (sentinelRef.current && hasMore) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [offset, loading, itemsPerPage, hasMore, selectedCategory, selectedBrand, sortBy, searchQuery]);

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedBrand !== 'all' ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6" id="produse">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Caută produse după nume, SKU sau descriere..."
            className="w-full pl-12 pr-12 py-3 border-2 border-neutral-300 rounded-lg text-base focus:border-blue-500 focus:outline-none transition"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full transition"
              aria-label="Clear search"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Toate Categoriile
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand Filters */}
      {brands.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBrand('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedBrand === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              Toate Brandurile
            </button>
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.name)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedBrand === brand.name
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control produse per pagină și sortare */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-neutral-600">
          Afișate <span className="font-semibold text-neutral-900">{rows.length}</span> produse
          {activeFiltersCount > 0 && (
            <span className="ml-2 text-blue-600">
              ({activeFiltersCount} {activeFiltersCount === 1 ? 'filtru activ' : 'filtre active'})
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Sortare */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Sortare:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border-2 border-neutral-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none"
            >
              <option value="default">Implicit (Cele mai noi)</option>
              <option value="price_asc">Preț crescător</option>
              <option value="price_desc">Preț descrescător</option>
              <option value="brand">Sortare după Brand</option>
            </select>
          </div>
          
          {/* Produse per pagină */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Per pagină:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 border-2 border-neutral-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none"
            >
              <option value={12}>12</option>
              <option value={18}>18</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={1000}>Toate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {rows.map((r) => {
          const galleryArr = Array.isArray(r.gallery) ? (r.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : [];
          const img = galleryArr?.[0] || '/vercel.svg';
          const hasDiscount = r.price_original && r.price_original > r.price_public_ttc;
          const discountPercent = hasDiscount
            ? Math.round(((r.price_original! - r.price_public_ttc) / r.price_original!) * 100)
            : 0;

          return (
            <Link key={r.id} href={`/p/${r.slug}`} className="group block">
              <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-3 relative">
                <ProductImage
                  src={img}
                  alt={r.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {hasDiscount && (
                  <div className="absolute top-3 right-3 text-xs text-white font-bold bg-red-600 px-2.5 py-1 rounded-full shadow-sm">
                    -{discountPercent}%
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <ShareButtons
                    url={`https://otka.ro/p/${r.slug}`}
                    title={r.name}
                    compact
                  />
                </div>
              </div>
              <h3 className="font-medium text-neutral-900 mb-1 group-hover:text-neutral-600 transition-colors line-clamp-2">
                {r.name}
              </h3>
              {r.brand_name && (
                <p className="text-xs text-purple-600 font-medium mb-2">
                  {r.brand_name}
                </p>
              )}
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="text-sm text-neutral-500 line-through">
                    {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(r.price_original!)}
                  </span>
                )}
                <span className="font-semibold text-neutral-900">
                  {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(r.price_public_ttc)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-300 border-t-blue-600"></div>
          <p className="mt-2 text-neutral-600">Se încarcă produse...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && rows.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-neutral-600 mb-2">Niciun produs găsit</p>
          <p className="text-neutral-500">Încearcă să modifici filtrele sau căutarea</p>
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      {!loading && hasMore && rows.length > 0 && (
        <div ref={sentinelRef} className="h-20 flex items-center justify-center">
          <p className="text-neutral-500 text-sm">Scroll pentru mai multe produse...</p>
        </div>
      )}

      {/* End of Results */}
      {!loading && !hasMore && rows.length > 0 && (
        <div className="text-center py-8 text-neutral-500 text-sm">
          Toate produsele au fost încărcate
        </div>
      )}
    </section>
  );
}
