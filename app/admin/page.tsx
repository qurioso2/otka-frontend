import { getServerSupabase } from "../auth/server";
import AdminDashboard from "./AdminDashboard";

export default async function Admin() {
  const supabase = await getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Debug info in development
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold">Acces restricționat</h1>
        <p className="mt-2 text-neutral-600">Autentifică-te pentru a accesa zona de administrare.</p>
        {isDev && authError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Auth Error: {authError.message}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <a href="/login" className="inline-flex rounded-full bg-black text-white px-4 py-2 text-sm">Login</a>
          <a href="/test-login" className="inline-flex rounded-full bg-blue-600 text-white px-4 py-2 text-sm">Test Login</a>
        </div>
      </div>
    );
  }

  const { data: profile, error: profileError } = await supabase.from('users').select('role').eq('email', user.email!).maybeSingle();
  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold">Acces refuzat</h1>
        <p className="mt-2 text-neutral-600">Nu ai rolul necesar (admin) pentru a accesa zona de administrare.</p>
        {isDev && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <div><strong>Debug Info:</strong></div>
            <div>User: {user.email}</div>
            <div>Profile: {profile ? JSON.stringify(profile) : 'null'}</div>
            <div>Profile Error: {profileError?.message || 'none'}</div>
            <div>Is Admin: {isAdmin ? 'true' : 'false'}</div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <a href="/debug-auth" className="inline-flex rounded-full bg-blue-600 text-white px-4 py-2 text-sm">Debug Auth</a>
          <a href="/test-login" className="inline-flex rounded-full bg-green-600 text-white px-4 py-2 text-sm">Test Login</a>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}