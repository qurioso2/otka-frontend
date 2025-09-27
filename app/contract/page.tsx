import { getCurrentAppUser } from "../../lib/userProfile";

export const dynamic = 'force-dynamic';

export default async function Contract() {
  const appUser = await getCurrentAppUser();
  const isActivePartner = appUser?.role === 'partner' && appUser?.partner_status === 'active';

  if (!isActivePartner) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Contract Parteneri</h1>
        <p className="mt-2 text-neutral-600">Acest document este disponibil doar partenerilor validați. Dacă ați primit invitație, autentificați-vă și reveniți după aprobarea contului.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Contract Parteneri</h1>
      <p className="mt-3">Puteți descărca ultima versiune a contractului de comision de mai jos:</p>
      <a href="/contract-partener.html" className="mt-4 inline-flex rounded-full bg-black text-white px-5 py-2.5 text-sm">Descarcă Contract</a>
    </div>
  );
}
