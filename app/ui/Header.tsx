import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function Header() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.delete(name, options),
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl tracking-tight">OTKA</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/parteneri" className="hover:opacity-70 transition">Parteneri</Link>
          {user ? (
            <>
              <Link href="/parteneri/dashboard" className="hover:opacity-70 transition">Dashboard</Link>
              <form action="/auth/logout" method="POST">
                <button className="rounded-full bg-black text-white px-4 py-1.5 hover:bg-neutral-800 transition">Logout</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-black text-white px-4 py-1.5 hover:bg-neutral-800 transition">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
