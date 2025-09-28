import { getServerSupabase } from "../../auth/server";
import { getCurrentAppUser } from "../../../lib/userProfile";
import PartnerDashboardTabs from "./PartnerDashboardTabs";

export default async function PartnerDashboard() {
  const supabase = await getServerSupabase();
  const appUser = await getCurrentAppUser();

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,sku,price_public_ttc,price_original,price_partner_net,stock_qty,gallery")
    .order("id", { ascending: false })
    .limit(1000);

  const { data: agreement } = await supabase
    .from('partner_agreements')
    .select('version, pdf_url, accepted_at')
    .eq('email', appUser?.email || '')
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isActivePartner = appUser?.role === 'partner' && appUser?.partner_status === 'active';
  const isAdmin = appUser?.role === 'admin';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Partener</h1>
        <form action="/auth/logout" method="POST">
          <button className="rounded-full bg-black text-white px-4 py-1.5 text-sm hover:bg-neutral-800 transition">Logout</button>
        </form>
      </div>

      {!isActivePartner && !isAdmin && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Contul tău este în așteptare pentru validare. După aprobarea de către un administrator, vei vedea prețurile nete și contractul de comision.
        </div>
      )}

      {/* Tabbed UI pentru parteneri */}
      <PartnerDashboardTabs
        isActivePartner={isActivePartner}
        isAdmin={isAdmin}
        agreement={agreement}
        initialProducts={(products || []).map(p => ({...p, price_partner_net: isActivePartner ? p.price_partner_net : null}))}
        profile={appUser}
      />
    </div>
  );
}