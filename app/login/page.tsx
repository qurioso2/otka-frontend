import { getServerSupabase } from '../auth/server';

export default async function Login() {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
  }

  if (data.user) {
    return (
      <div className="p-4">
        <h1>Logged In</h1>
        <p>User: {JSON.stringify(data.user)}</p>
        <form action="/auth/logout" method="POST">
          <button type="submit" className="bg-red-500 text-white p-2 m-2">
            Logout
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1>Login as Partner</h1>
      <form action="/auth/login" method="POST">
        <input
          type="email"
          name="email"
          defaultValue="test@otka.ro"
          placeholder="Email"
          className="border p-2 m-2"
        />
        <input
          type="password"
          name="password"
          defaultValue="testpass123"
          placeholder="Password"
          className="border p-2 m-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 m-2">
          Login
        </button>
      </form>
      {data.user && <p>Already logged in as: {JSON.stringify(data.user)}</p>}
    </div>
  );
}