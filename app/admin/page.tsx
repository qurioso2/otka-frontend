import { getServerSupabase } from "../auth/server";
import AdminDashboard from "./AdminDashboard";

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
        <a href="/debug-auth" className="mt-4 inline-flex rounded-full bg-blue-600 text-white px-4 py-2 text-sm">Debug Auth</a>
      </div>
    );
  }

  return <AdminDashboard />;
}