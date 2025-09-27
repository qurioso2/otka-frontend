import { getServerSupabase } from "../auth/server";

export default async function Admin() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold">Acces restricționat</h1>
        <p className="mt-2 text-neutral-600">Autentifică-te pentru a accesa importul CSV.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Import CSV produse</h1>
      <p className="mt-2 text-neutral-600 text-sm">Coloane: sku,name,slug,price_public_ttc,price_partner_net,stock_qty,gallery,visible</p>
      <form action="/api/admin/import" method="POST" encType="multipart/form-data" className="mt-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
        <input type="file" name="file" accept=".csv" className="text-sm" />
        <button className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">Importă</button>
      </form>
    </div>
  );
}
