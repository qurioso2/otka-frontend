import { getServerSupabase } from "../auth/server";

export default async function Login(props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  const sp = props.searchParams ? await props.searchParams : undefined;
  const err = sp?.error;
  const errorMsg = Array.isArray(err) ? err[0] : err;

  if (data.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Ești autentificat</h1>
        <p className="mt-2 text-neutral-600 break-all">{data.user.email}</p>
        <form action="/auth/logout" method="POST" className="mt-6">
          <button type="submit" className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition">Logout</button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Login Partener</h1>
      <p className="mt-2 text-neutral-600">Accesezi prețurile nete și resursele partenerilor.</p>
      {errorMsg && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}
      <form action="/auth/login" method="POST" className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-neutral-700">Email</label>
          <input type="email" name="email" defaultValue="test@otka.ro" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <div>
          <label className="block text-sm text-neutral-700">Parolă</label>
          <input type="password" name="password" defaultValue="testpass123" className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </div>
        <button type="submit" className="w-full rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition">Autentificare</button>
      </form>
    </div>
  );
}
