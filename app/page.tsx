import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import AddToCartButton from "./ui/AddToCartButton";
import ProductImage from "./ui/ProductImage";

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

function StockBadge({ qty, status }: { qty: number; status?: string }) {
  if (status === 'reserved') {
    return <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium">Rezervat</span>;
  }
  if (status === 'discontinued') {
    return <span className="rounded-full bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium">Discontinuat</span>;
  }
  if (qty === 0) {
    return <span className="rounded-full bg-red-100 text-red-800 px-2 py-1 text-xs font-medium">Epuizat</span>;
  }
  if (qty <= 3) {
    return <span className="rounded-full bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium">Ultimele bucăți ({qty})</span>;
  }
  if (qty <= 10) {
    return <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium">Stoc limitat ({qty})</span>;
  }
  return <span className="rounded-full bg-green-100 text-green-800 px-2 py-1 text-xs font-medium">În stoc ({qty})</span>;
}

function Price({ value }: { value: number }) {
  return (
    <div className="mt-1 text-lg font-semibold text-neutral-900">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(value || 0)}</div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200 overflow-hidden bg-white">
      <div className="aspect-[4/3] bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-neutral-100 rounded" />
        <div className="h-3 w-1/3 bg-neutral-100 rounded" />
        <div className="h-5 w-1/2 bg-neutral-100 rounded" />
      </div>
    </div>
  );
}

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products_public")
    .select("id,sku,name,slug,price_public_ttc,stock_qty,gallery")
    .order("id", { ascending: false })
    .limit(24);

  const rows: ProductPublic[] = (products as ProductPublic[] | null) ?? [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "name": "OTKA",
    "description": "Mobilier, corpuri de iluminat și obiecte decorative pentru design interior",
    "url": process.env.NEXT_PUBLIC_URL || "https://otka.ro",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Mobilier și Design Interior",
      "itemListElement": rows.slice(0, 10).map((product, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Product",
          "name": product.name,
          "sku": product.sku,
          "category": "Furniture",
          "offers": {
            "@type": "Offer",
            "price": product.price_public_ttc,
            "priceCurrency": "RON",
            "availability": product.stock_qty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }
      }))
    }
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Hero */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 leading-tight">
                Mobilier și Design Interior
              </h1>
              <p className="mt-4 text-lg text-neutral-700 leading-relaxed">
                Descoperă colecția noastră de mobilier, corpuri de iluminat și obiecte decorative pentru amenajări interioare. Produse de calitate, design modern, prețuri avantajoase.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="#produse" className="btn-primary">Descoperă Colecția</a>
                <a href="/parteneri" className="inline-flex items-center justify-center rounded-full border-2 border-neutral-900 text-neutral-900 px-6 py-2.5 text-sm font-bold hover:bg-neutral-900 hover:text-white transition">Parteneriat Design</a>
              </div>
            </div>
            <div className="hidden md:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/product-placeholder.jpg" alt="Amenajare interioară" className="w-full h-auto rounded-2xl border border-neutral-200 card-shadow" />
            </div>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section id="produse" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        {error && (<div className="text-red-600">{error.message}</div>)}

        {!error && rows.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-neutral-900">Nu există produse vizibile momentan</h3>
            <p className="mt-2 text-neutral-600">Reveniți în curând sau contactați-ne pentru disponibilitate.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {rows.length === 0 && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

          {rows.map((p) => {
            const galleryArr = Array.isArray(p.gallery) ? (p.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : null;
            const img = galleryArr?.[0] || "/images/product-placeholder.jpg";
            return (
              <div key={p.id} className="group rounded-2xl border border-neutral-200 overflow-hidden bg-white card-shadow transition-all duration-300">
                <Link href={`/p/${p.slug}`}>
                  <div className="aspect-[4/3] bg-neutral-50 overflow-hidden">
                    <ProductImage src={img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Link href={`/p/${p.slug}`} className="font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-2">{p.name}</Link>
                    <StockBadge qty={p.stock_qty || 0} />
                  </div>
                  <div className="mb-3">
                    <div className="text-neutral-600 text-sm mb-1">TVA inclus</div>
                    <Price value={p.price_public_ttc || 0} />
                  </div>
                  <AddToCartButton item={{ id: p.id as number, sku: p.sku, name: p.name, price: p.price_public_ttc || 0, image: img }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}