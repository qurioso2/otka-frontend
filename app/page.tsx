import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import AddToCartButton from "./ui/AddToCartButton";
import ProductImage from "./ui/ProductImage";
import { headers } from 'next/headers';

interface ProductPublic {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price_public_ttc: number;
  price_original?: number;
  stock_qty: number;
  gallery: unknown[] | null;
}

async function getHeroUrl() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/public/og`, { cache: 'no-store', headers: { 'x-next-headers': JSON.stringify(Object.fromEntries(headers())) } });
  const data = await res.json().catch(()=>({ url: '/images/product-placeholder.jpg' }));
  return data.url as string;
}

export default async function Home() {
  const heroUrl = await getHeroUrl();
  const { data: products, error } = await supabase
    .from("products_public")
    .select("id,sku,name,slug,price_public_ttc,stock_qty,gallery")
    .order("id", { ascending: false })
    .range(0, 17);

  const rows: ProductPublic[] = (products as ProductPublic[] | null) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 leading-tight">Mobilier și Design Interior</h1>
              <p className="mt-4 text-lg text-neutral-700 leading-relaxed">Descoperă colecția noastră de mobilier, corpuri de iluminat și obiecte decorative pentru amenajări interioare. Produse de calitate, design modern, prețuri avantajoase.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="#produse" className="btn-primary">Descoperă Colecția</a>
                <a href="/parteneri" className="inline-flex items-center justify-center rounded-full border-2 border-neutral-900 text-neutral-900 px-6 py-2.5 text-sm font-bold hover:bg-neutral-900 hover:text-white transition">Parteneriat Design</a>
              </div>
            </div>
            <div className="hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroUrl || "/images/product-placeholder.jpg"} alt="Amenajare interioară" className="w-full h-auto rounded-2xl border border-neutral-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Products grid with infinite scroll (hydrated client component) */}
      <ProductsInfinite initialRows={rows} />
    </div>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';

function ProductsInfinite({ initialRows }: { initialRows: ProductPublic[] }) {
  const [rows, setRows] = useState<ProductPublic[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialRows.length);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading) {
        setLoading(true);
        try {
          const res = await fetch(`/api/public/products?offset=${offset}&limit=18`, { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data) && data.length) {
            setRows((prev) => [...prev, ...data]);
            setOffset((o) => o + data.length);
          }
        } catch {}
        finally { setLoading(false); }
      }
    }, { threshold: 0.2 });
    if (sentinelRef.current) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [offset, loading]);

  return (
    <section id="produse" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rows.map((p) => {
          const galleryArr = Array.isArray(p.gallery) ? (p.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : null;
          const img = galleryArr?.[0] || "/images/product-placeholder.jpg";
          return (
            <div key={p.id} className="group rounded-2xl border border-neutral-200 overflow-hidden bg-white transition-all duration-300">
              <Link href={`/p/${p.slug}`}>
                <div className="aspect-[4/3] bg-neutral-50 overflow-hidden">
                  <ProductImage src={img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Link href={`/p/${p.slug}`} className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-2">{p.name}</Link>
                </div>
                <div className="mb-3">
                  <div className="text-neutral-600 text-sm mb-1">TVA inclus</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}</div>
                </div>
                <AddToCartButton item={{ id: p.id as number, sku: p.sku, name: p.name, price: p.price_public_ttc || 0, image: img }} />
              </div>
            </div>
          );
        })}
      </div>
      <div ref={sentinelRef} className="h-12 flex items-center justify-center text-neutral-500">{loading ? 'Se încarcă...' : ' '}</div>
    </section>
  );
}