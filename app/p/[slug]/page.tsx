import { supabase } from "../../../lib/supabaseClient";
import type { Database } from "../../../types/supabase";
import Link from "next/link";
import AddToCartClient from './AddToCartClient';
import ProductGallery from './ProductGallery';

export const revalidate = 60; // ISR

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

type PageProps = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold text-neutral-900">Produsul nu a fost găsit</h1>
        <p className="mt-2 text-neutral-600">S-ar putea să fi fost scos din stoc sau ascuns.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-black text-white px-5 py-2.5 text-sm">Înapoi la produse</Link>
      </div>
    );
  }

  const p = data as ProductRow;
  const galleryArr = Array.isArray(p.gallery) ? (p.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  const img = galleryArr?.[0] || "/vercel.svg";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductGallery images={galleryArr} productName={p.name} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{p.name}</h1>
          <div className="mt-2 text-neutral-600 text-sm">TVA inclus</div>
          <div className="flex items-center gap-3 mt-2">
            {p.price_original && p.price_original > p.price_public_ttc && (
              <div className="text-lg text-neutral-500 line-through">
                {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_original)}
              </div>
            )}
            <div className="text-2xl font-semibold text-neutral-900">
              {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}
            </div>
            {p.price_original && p.price_original > p.price_public_ttc && (
              <div className="text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                -{Math.round(((p.price_original - p.price_public_ttc) / p.price_original) * 100)}%
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3 text-neutral-700">
            <div><span className="text-neutral-500">SKU:</span> {p.sku}</div>
            <div><span className="text-neutral-500">Stoc:</span> {p.stock_qty}</div>
            {p.location && <div><span className="text-neutral-500">Locație:</span> {p.location}</div>}
          </div>

          <div className="mt-6">
            <AddToCartClient item={{ id: p.id as number, sku: p.sku, name: p.name, price: p.price_public_ttc || 0, image: img }} />
          </div>

          <div className="mt-6">
            <Link href="/" className="inline-flex rounded-full bg-black text-white px-5 py-2.5 text-sm">Înapoi</Link>
          </div>
        </div>
      </div>

      {/* Galeria este acum integrată în ProductGallery */}
    </div>
  );
}
