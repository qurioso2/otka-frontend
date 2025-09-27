import { getServerSupabase } from "../../auth/server";
import PartnerProducts from "./PartnerProducts";
import Uploader from "./Uploader";
import { getCurrentAppUser } from "../../../lib/userProfile";
import ContractCard from "./ContractCard";

export default async function PartnerDashboard() {
  const supabase = await getServerSupabase();
  const appUser = await getCurrentAppUser();

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,sku,price_public_ttc,price_partner_net,stock_qty,gallery")
    .order("id", { ascending: false })
    .limit(1000);

  const isActivePartner = appUser?.role === 'partner' && appUser?.partner_status === 'active';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Partener</h1>
        <form action="/auth/logout" method="POST">
          <button className="rounded-full bg-black text-white px-4 py-1.5 text-sm hover:bg-neutral-800 transition">Logout</button>
        </form>
      </div>

      {!isActivePartner && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Contul tău este în așteptare pentru validare. După aprobarea de către un administrator, vei vedea prețurile nete și contractul de comision.
        </div>
      )}

      <div>
        {error ? (
          <div className="text-red-600">{error.message}</div>
        ) : (
          <PartnerProducts initialProducts={(products || []).map(p => ({
            ...p,
            // Dacă nu e activ, ascundem prețul partener
            price_partner_net: isActivePartner ? p.price_partner_net : null,
          })) as any} />
        )}
      </div>

      {isActivePartner && <ContractCard />}

      <Uploader />

      <div className="text-sm text-neutral-600">
        <h2 className="text-neutral-900 font-medium">Termeni</h2>
        <p className="mt-2">Accesul complet la resurse este disponibil după validarea contului de către administrator.</p>
      </div>
    </div>
  );
}
