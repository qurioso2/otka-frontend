import { supabase } from "../lib/supabaseClient";
import ProductsInfinite from "./ui/ProductsInfinite";
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
  description?: string | null;
}

async function getHeroUrl() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/public/og`, { cache: 'no-store' });
    const data = await res.json();
    // Fix the URL if it has the placeholder domain
    if (data.url && data.url.includes('pub-your-r2-domain.cloudflare.com')) {
      return data.url.replace('pub-your-r2-domain.cloudflare.com', 'pub-52df54499f9f4836a88ab79b2ff9f8cb.r2.dev');
    }
    return data.url || '/images/product-placeholder.jpg';
  } catch (error) {
    return '/images/product-placeholder.jpg';
  }
}

export default async function Home() {
  const heroUrl = await getHeroUrl();
  const { data: products, error } = await supabase
    .from("products_public")
    .select("id,sku,name,slug,price_public_ttc,stock_qty,gallery,description")
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