import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import AddToCartButton from "./ui/AddToCartButton";

interface ProductPublic {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price_public_ttc: number;
  stock_qty: number;
  gallery: unknown[] | null;
}

function StockBadge({ qty }: { qty: number }) {
  const status = qty > 0 ? "Disponibil" : "Rezervat";
  const color = qty > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>{status}</span>;
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

  // Structured data pentru SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "OTKA",
    "description": "Produse resigilate și ex-demo de calitate",
    "url": process.env.NEXT_PUBLIC_URL || "https://otka.ro",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Produse resigilate și expuse",
      "itemListElement": rows.slice(0, 10).map((product, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Product",
          "name": product.name,
          "sku": product.sku,
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
      {/* Structured Data pentru SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section - îmbunătățit pentru SEO și contrast */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-tight">
              Produse resigilate și expuse
            </h1>
            <p className="mt-6 text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
              Descoperă selecția noastră exclusivă de produse resigilate și ex-demo cu prețuri avantajoase. 
              Calitate garantată, stocuri limitate.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#produse" className="btn-primary inline-flex items-center justify-center rounded-full text-white px-8 py-3 text-base font-medium shadow-lg">
                Vezi toate produsele
              </a>
              <a href="/parteneri" className="inline-flex items-center justify-center rounded-full border-2 border-neutral-900 text-neutral-900 px-8 py-3 text-base font-medium hover:bg-neutral-900 hover:text-white transition">
                Devino partener
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="produse" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        {error && (
          <div className="text-red-600">{error.message}</div>
        )}

        {/* Empty state */}
        {!error && rows.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-neutral-900">Nu există produse vizibile momentan</h3>
            <p className="mt-2 text-neutral-600">Reveniți în curând sau contactați-ne pentru disponibilitate.</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {rows.length === 0 && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

          {rows.map((p) => {
            const galleryArr = Array.isArray(p.gallery) ? (p.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : null;
            const img = galleryArr?.[0] || "/vercel.svg";
            return (
              <div key={p.id} className="group rounded-2xl border border-neutral-200 overflow-hidden bg-white card-shadow transition-all duration-300">
                <Link href={`/p/${p.slug}`}>
                  <div className="aspect-[4/3] bg-neutral-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
