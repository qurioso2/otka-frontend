import { getServerSupabase } from "../../auth/server";
import PartnerProducts from "./PartnerProducts";
import Uploader from "./Uploader";
import { getCurrentAppUser } from "../../../lib/userProfile";

export default async function PartnerDashboard() {
  const supabase = await getServerSupabase();
  const appUser = await getCurrentAppUser();

  const { data: products, error } = await supabase
    .from("products")
    .select("id,name,sku,price_public_ttc,price_partner_net,stock_qty,gallery")
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

      {isActivePartner && !agreement && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <h3 className="font-medium text-neutral-900">Trebuie să acceptați termenii programului de parteneriat</h3>
          <p className="mt-1 text-sm text-neutral-600">Vă rugăm să parcurgeți și să acceptați termenii pentru a continua.</p>
          <a href="/parteneri/acceptare" className="mt-3 inline-flex rounded-full bg-black text-white px-4 py-2 text-sm">Acceptă termeni</a>
        </div>
      )}

      {isActivePartner && agreement && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <div className="text-emerald-900 font-medium">Contract semnat</div>
          <div className="mt-1 text-emerald-800">Versiune: {agreement.version} · Data: {agreement.accepted_at ? new Date(agreement.accepted_at as unknown as string).toLocaleDateString('ro-RO') : '-'}</div>
          {agreement.pdf_url && <a href={agreement.pdf_url} target="_blank" className="underline">Descarcă PDF</a>}
        </div>
      )}

      <div>
        {error ? (
          <div className="text-red-600">{error.message}</div>
        ) : (
          <PartnerProducts initialProducts={(products || []).map(p => ({
            ...p,
            price_partner_net: isActivePartner ? p.price_partner_net : null,
          })) as any} />
        )}
      </div>

      <Uploader />
    </div>
  );
}
