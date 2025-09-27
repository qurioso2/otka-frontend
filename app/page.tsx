import { supabase } from "../lib/supabaseClient";

function StockBadge({ qty }: { qty: number }) {
  const status = qty > 0 ? "Disponibil" : "Rezervat";
  const color = qty > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>{status}</span>;
}

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,slug,price_public_ttc,stock_qty,gallery")
    .eq("visible", true)
    .order("id", { ascending: false })
    .limit(24);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900">Produse resigilate și expuse</h1>
          <p className="mt-4 text-neutral-600 text-lg max-w-2xl">Prețuri avantajoase la selecția noastră de produse resigilate și ex-demo. Stocuri limitate.</p>
          <div className="mt-8">
            <a href="#produse" className="inline-flex rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition">Vezi produsele</a>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="produse" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        {error && (
          <div className="text-red-600">{error.message}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products?.map((p) => {
            const images = (p as any).gallery as string[] | null;
            const img = Array.isArray(images) && images.length > 0 ? images[0] : "/vercel.svg";
            return (
              <div key={p.id} className="group rounded-2xl border border-neutral-200 overflow-hidden bg-white hover:shadow-md transition">
                <div className="aspect-[4/3] bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-neutral-900 group-hover:opacity-80 transition">{p.name}</h3>
                    <StockBadge qty={(p as any).stock_qty || 0} />
                  </div>
                  <div className="mt-2 text-neutral-600 text-sm">TVA inclus</div>
                  <div className="mt-1 text-lg font-semibold">{new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format((p as any).price_public_ttc || 0)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
