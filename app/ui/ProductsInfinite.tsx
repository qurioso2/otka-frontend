'use client';
import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";
import ShareButtons from "@/components/ShareButtons";

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
}

interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export default function ProductsInfinite({ initialRows }: { initialRows: ProductPublic[] }) {
  const [rows, setRows] = useState<ProductPublic[]>(initialRows);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialRows.length);
  const [itemsPerPage, setItemsPerPage] = useState(18);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  // Reload products when category or sort changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const categoryParam = selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
        const sortParam = sortBy !== 'default' ? `&sort=${sortBy}` : '';
        const res = await fetch(`/api/public/products?offset=0&limit=${itemsPerPage}${categoryParam}${sortParam}`, { cache: 'no-store' });
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
  }, [selectedCategory, sortBy, itemsPerPage]);

  // Infinite scroll
  useEffect(() => {
    const io = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setLoading(true);
        try {
          const categoryParam = selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
          const res = await fetch(`/api/public/products?offset=${offset}&limit=${itemsPerPage}${categoryParam}`, { cache: 'no-store' });
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
  }, [offset, loading, itemsPerPage, hasMore, selectedCategory]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6" id="produse">
      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Toate
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

      {/* Control produse per pagină */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          Afișate <span className="font-semibold text-neutral-900">{rows.length}</span> produse
          {selectedCategory !== 'all' && (
            <span className="ml-2 text-blue-600">
              din categoria <strong>{selectedCategory}</strong>
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-700">Produse per pagină:</label>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rows.map((p) => {
          const galleryArr = Array.isArray(p.gallery) ? (p.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : null;
          const img = galleryArr?.[0] || "/images/product-placeholder.jpg";
          return (
            <div key={p.id} className="group rounded-2xl border border-neutral-200 bg-white transition-all duration-300 relative">
              <Link href={`/p/${p.slug}`}>
                <div className="aspect-[4/3] bg-neutral-50 overflow-hidden rounded-t-2xl">
                  <ProductImage src={img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Link href={`/p/${p.slug}`} className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-2">{p.name}</Link>
                </div>
                <div className="mb-3">
                  <div className="text-neutral-600 text-sm mb-1">TVA inclus</div>
                  <div className="flex items-center gap-2">
                    {p.price_original && p.price_original > p.price_public_ttc && (
                      <div className="text-sm text-neutral-500 line-through">
                        {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_original)}
                      </div>
                    )}
                    <div className="text-lg font-semibold text-neutral-900">
                      {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}
                    </div>
                    {p.price_original && p.price_original > p.price_public_ttc && (
                      <div className="text-xs text-white font-bold bg-red-600 px-2.5 py-1 rounded-full shadow-sm">
                        -{Math.round(((p.price_original - p.price_public_ttc) / p.price_original) * 100)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <AddToCartButton item={{ id: p.id as number, sku: p.sku, name: p.name, price: p.price_public_ttc || 0, image: img }} />
                  </div>
                  <ShareButtons 
                    url={`/p/${p.slug}`}
                    title={p.name}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-1" />}
      {loading && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-600"></div>
            Se încarcă produse...
          </div>
        </div>
      )}
      {!hasMore && rows.length > initialRows.length && (
        <div className="py-8 text-center text-sm text-neutral-500">
          Toate produsele au fost încărcate
        </div>
      )}
    </section>
  );
}