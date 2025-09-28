import { getServerSupabase } from "../auth/server";

export default async function DebugAuth() {
  const supabase = await getServerSupabase();
  
  let authInfo: any = {};
  let usersInfo: any = {};
  let adminLogicTest: any = {};
  let error: string | null = null;

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    authInfo = {
      isAuthenticated: !!user,
      email: user?.email || null,
      userId: user?.id || null,
      error: authError?.message || null
    };

    // Try to get users with admin role
    const { data: adminUsers, error: usersError } = await supabase
      .from('users')
      .select('email, role, partner_status')
      .eq('role', 'admin');
    
    usersInfo = {
      adminUsersCount: adminUsers?.length || 0,
      adminUsers: adminUsers || [],
      error: usersError?.message || null
    };

    // If user is authenticated, check their profile EXACTLY like admin page does
    if (user?.email) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, partner_status, company_name')
        .eq('email', user.email)
        .maybeSingle();
      
      authInfo.profile = profile;
      authInfo.profileError = profileError?.message || null;
      authInfo.isAdmin = profile?.role === 'admin';
    }

    // Test the EXACT admin logic from admin/page.tsx
    if (user) {
      const { data: adminProfile, error: adminProfileError } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email!)
        .maybeSingle();
      
      adminLogicTest = {
        query: `SELECT role FROM users WHERE email = '${user.email}'`,
        profile: adminProfile,
        error: adminProfileError?.message || null,
        isAdmin: adminProfile?.role === 'admin',
        adminPageWouldPass: !!user && adminProfile?.role === 'admin'
      };
    }

  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Authentication</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="font-semibold text-red-800">General Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Authentication Status */}
      <div className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">👤 Authentication Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Authenticated:</span>
            <span className={authInfo.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {authInfo.isAuthenticated ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          {authInfo.email && (
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span className="text-blue-600">{authInfo.email}</span>
            </div>
          )}
          {authInfo.userId && (
            <div className="flex justify-between">
              <span className="font-medium">User ID:</span>
              <span className="text-gray-600 font-mono text-sm">{authInfo.userId}</span>
            </div>
          )}
          {authInfo.error && (
            <div className="mt-2 p-2 bg-red-50 rounded">
              <span className="text-red-700">Auth Error: {authInfo.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Information */}
      {authInfo.isAuthenticated && (
        <div className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">👤 User Profile</h2>
          {authInfo.profile ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  authInfo.profile.role === 'admin' ? 'bg-green-100 text-green-800' :
                  authInfo.profile.role === 'partner' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {authInfo.profile.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span>{authInfo.profile.partner_status}</span>
              </div>
              {authInfo.profile.company_name && (
                <div className="flex justify-between">
                  <span className="font-medium">Company:</span>
                  <span>{authInfo.profile.company_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Admin Access:</span>
                <span className={authInfo.isAdmin ? 'text-green-600' : 'text-red-600'}>
                  {authInfo.isAdmin ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                User is authenticated but no profile found in users table.
                {authInfo.profileError && ` Error: ${authInfo.profileError}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Admin Users Information */}
      <div className="mb-6 p-6 bg-white border-2 border-gray-200 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">👑 Admin Users in Database</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Total Admin Users:</span>
            <span className={usersInfo.adminUsersCount > 0 ? 'text-green-600' : 'text-red-600'}>
              {usersInfo.adminUsersCount}
            </span>
          </div>
          
          {usersInfo.adminUsersCount > 0 ? (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Admin Users:</h3>
              {usersInfo.adminUsers.map((user: any, index: number) => (
                <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                  <div className="flex justify-between">
                    <span>{user.email}</span>
                    <span className="text-sm text-gray-600">{user.partner_status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-medium">⚠️ No admin users found!</p>
              <p className="text-red-700 text-sm mt-1">
                This is likely why the admin dashboard is not accessible. You need to create admin users in the database.
              </p>
            </div>
          )}
          
          {usersInfo.error && (
            <div className="mt-2 p-2 bg-red-50 rounded">
              <span className="text-red-700">Users Query Error: {usersInfo.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">🛠️ Next Steps</h2>
        <div className="space-y-3 text-blue-800">
          {!authInfo.isAuthenticated && (
            <div>
              <h3 className="font-medium">1. Authentication Required</h3>
              <p className="text-sm">You need to log in first. Go to <a href="/login" className="underline">/login</a></p>
            </div>
          )}
          
          {usersInfo.adminUsersCount === 0 && (
            <div>
              <h3 className="font-medium">2. Create Admin Users</h3>
              <p className="text-sm">
                No admin users exist in the database. You need to run the SQL setup script to create admin users.
                Check the <code className="bg-white px-1 rounded">sql/setup_admin_users_fixed.sql</code> file.
              </p>
            </div>
          )}
          
          {authInfo.isAuthenticated && !authInfo.isAdmin && (
            <div>
              <h3 className="font-medium">3. Admin Role Required</h3>
              <p className="text-sm">
                Your account ({authInfo.email}) does not have admin role. 
                Contact a database administrator to update your role to 'admin'.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 flex gap-4">
        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Login
        </a>
        <a href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          Try Admin Dashboard
        </a>
        <a href="/" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Homepage
        </a>
      </div>
    </div>
  );
}