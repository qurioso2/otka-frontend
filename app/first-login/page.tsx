import { getServerSupabase } from "../auth/server";

export default async function FirstLogin() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Linkul nu este valid</h1>
        <p className="mt-2 text-neutral-600">Te rugăm să folosești linkul magic din email sau să soliciți un link nou.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Setează parola</h1>
      <p className="mt-2 text-neutral-600">Salut, {user.email}. După setarea parolei, te vom redirecționa către Dashboard.</p>
      <form action="/auth/set-password" method="POST" className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-neutral-700">Parolă nouă</label>
          <input type="password" name="password" minLength={8} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" required />
        </div>
        <button type="submit" className="w-full rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition">Salvează parola</button>
      </form>
    </div>
  );
}
