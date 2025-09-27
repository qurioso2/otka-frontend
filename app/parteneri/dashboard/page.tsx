import { getServerSupabase } from "../../auth/server";
import PartnerProducts from "./PartnerProducts";

export default async function PartnerDashboard() {
  const supabase = await getServerSupabase();

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,sku,price_public_ttc,price_partner_net,stock_qty,gallery")
    .order("id", { ascending: false })
    .limit(1000);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Partener</h1>
        <form action="/auth/logout" method="POST">
          <button className="rounded-full bg-black text-white px-4 py-1.5 text-sm hover:bg-neutral-800 transition">Logout</button>
        </form>
      </div>

      <div className="mt-6">
        {error ? (
          <div className="text-red-600">{error.message}</div>
        ) : (
          <PartnerProducts initialProducts={products || []} />
        )}
      </div>

      <div className="mt-12 text-sm text-neutral-600">
        <h2 className="text-neutral-900 font-medium">Termeni & Comisioane</h2>
        <p className="mt-2">Comision standard 5% din prețul de vânzare către clientul final. Eligibilitate: comisionul se acordă când comanda e inițiată de lead-ul partenerului. Plată: lunar, la 30 zile de la livrare.</p>
      </div>
    </div>
  );
}
