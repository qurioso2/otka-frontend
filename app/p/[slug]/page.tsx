import { supabase } from "../../../lib/supabaseClient";
import type { Database } from "../../../types/supabase";
import Link from "next/link";

export const revalidate = 60; // ISR

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
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
        <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={p.name} className="w-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{p.name}</h1>
          <div className="mt-2 text-neutral-600 text-sm">TVA inclus</div>
          <div className="mt-1 text-2xl font-semibold text-neutral-900">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}</div>

          <div className="mt-6 space-y-3 text-neutral-700">
            <div><span className="text-neutral-500">SKU:</span> {p.sku}</div>
            <div><span className="text-neutral-500">Stoc:</span> {p.stock_qty}</div>
            {p.location && <div><span className="text-neutral-500">Locație:</span> {p.location}</div>}
          </div>

          <div className="mt-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-600">TVA inclus</div>
              <div className="text-2xl font-semibold text-neutral-900 mt-1">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}</div>
              <div className="mt-3">
                {/* Add to cart */}
                {/* @ts-expect-error Server Component -> Client interop via dynamic import not necessary here */}
                <a href={`/api/add-to-cart?id=${p.id}`} className="hidden"/>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link href="/" className="inline-flex rounded-full bg-black text-white px-5 py-2.5 text-sm">Înapoi</Link>
          </div>
        </div>
      </div>

      {galleryArr.length > 1 && (
        <div className="mt-12">
          <h2 className="text-lg font-medium text-neutral-900">Galerie</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryArr.slice(1).map((g, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={g} alt={`${p.name} ${i+1}`} className="rounded-xl border border-neutral-200 object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
