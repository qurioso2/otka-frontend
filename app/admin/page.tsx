import { getServerSupabase } from "../auth/server";
import UsersAdmin from "./UsersAdmin";
import ClientsAdmin from "./ClientsAdmin";

export default async function Admin() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold">Acces restricționat</h1>
        <p className="mt-2 text-neutral-600">Autentifică-te pentru a accesa zona de administrare.</p>
        <a href="/login" className="mt-4 inline-flex rounded-full bg-black text-white px-4 py-2 text-sm">Login</a>
      </div>
    );
  }

  const { data: profile } = await supabase.from('users').select('role').eq('email', user.email!).maybeSingle();
  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold">Acces refuzat</h1>
        <p className="mt-2 text-neutral-600">Nu ai rolul necesar (admin) pentru a accesa zona de administrare.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">
      <h1 className="text-2xl font-semibold">Administrare</h1>
      <p className="mt-2 text-neutral-600 text-sm">Import produse CSV, gestiune parteneri, clienți și comenzi manuale.</p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="font-medium text-neutral-900">Import CSV produse</h2>
        <form action="/api/admin/import" method="POST" encType="multipart/form-data" className="mt-4 space-y-3">
          <input type="file" name="file" accept=".csv" className="text-sm" />
          <button className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">Importă</button>
        </form>
      </div>

      <UsersAdmin />
      <ClientsAdmin />
    </div>
  );
}
