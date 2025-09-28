import { getServerSupabase } from "../auth/server";
import { getCurrentAppUser } from "../../lib/userProfile";

export default async function DebugAuth() {
  const supabase = await getServerSupabase();
  
  // 1. Verifică dacă utilizatorul este autentificat
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // 2. Încearcă să găsească profilul în tabela users
  let profile = null;
  let profileError = null;
  if (user?.email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();
    profile = data;
    profileError = error;
  }

  // 3. Testează getCurrentAppUser
  let currentAppUser = null;
  let appUserError = null;
  try {
    currentAppUser = await getCurrentAppUser();
  } catch (error) {
    appUserError = error;
  }

  // 4. Testează dacă poate vedea alți utilizatori (pentru admin)
  const { data: allUsers, error: usersError } = await supabase
    .from('users')
    .select('email, role, partner_status');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Debug Autentificare Admin</h1>
      
      <div className="space-y-6">
        {/* Auth Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">1. Status Autentificare Supabase</h2>
          {authError ? (
            <div className="text-red-600">Eroare: {authError.message}</div>
          ) : user ? (
            <div className="text-green-600">
              ✅ Autentificat ca: <strong>{user.email}</strong>
              <br />
              User ID: {user.id}
              <br />
              Role în JWT: {JSON.stringify(user.user_metadata)}
            </div>
          ) : (
            <div className="text-red-600">❌ Nu ești autentificat</div>
          )}
        </div>

        {/* Profile Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">2. Profil în Tabela Users</h2>
          {profileError ? (
            <div className="text-red-600">
              ❌ Eroare la citirea profilului: {profileError.message}
            </div>
          ) : profile ? (
            <div className="text-green-600">
              ✅ Profil găsit:
              <pre className="mt-2 bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-orange-600">
              ⚠️ Profilul nu există în tabela users pentru {user?.email}
            </div>
          )}
        </div>

        {/* getCurrentAppUser Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">3. getCurrentAppUser() Result</h2>
          {appUserError ? (
            <div className="text-red-600">
              ❌ Eroare: {String(appUserError)}
            </div>
          ) : currentAppUser ? (
            <div className="text-green-600">
              ✅ App User:
              <pre className="mt-2 bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify(currentAppUser, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">❌ getCurrentAppUser() a returnat null</div>
          )}
        </div>

        {/* All Users (Admin Test) */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">4. Test Acces Admin (Toți Utilizatorii)</h2>
          {usersError ? (
            <div className="text-red-600">
              ❌ Nu poți vedea utilizatorii: {usersError.message}
              <br />
              <small>Aceasta înseamnă că RLS policies blochează accesul admin</small>
            </div>
          ) : allUsers ? (
            <div className="text-green-600">
              ✅ Poți vedea {allUsers.length} utilizatori (ești admin):
              <pre className="mt-2 bg-gray-100 p-2 rounded text-sm max-h-40 overflow-y-auto">
                {JSON.stringify(allUsers, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-orange-600">⚠️ Lista utilizatori goală</div>
          )}
        </div>

        {/* Diagnostic */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2 text-blue-800">🔧 Diagnostic și Soluții</h2>
          <div className="text-sm text-blue-700 space-y-2">
            {!user && <div>• Nu ești logat - încearcă să te loghezi din nou</div>}
            {user && !profile && (
              <div>• Email-ul {user.email} nu există în tabela users - rulează setup_admin_users_fixed.sql</div>
            )}
            {user && profile && profile.role !== 'admin' && (
              <div>• Rolul tău este "{profile.role}" în loc de "admin" - actualizează în baza de date</div>
            )}
            {user && profile && profile.role === 'admin' && usersError && (
              <div>• Ești admin dar RLS policies blochează accesul - rulează fix_auth_function.sql</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}