import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CartButton from "./CartButton";

export default async function Header() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesArray) => {
          cookiesArray.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl tracking-tight text-neutral-900">OTKA</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/parteneri" className="rounded-full border border-neutral-300 text-neutral-700 px-4 py-1.5 hover:bg-neutral-50 transition text-sm">Parteneri</Link>
          <CartButton />
          {user ? (
            <>
              <Link href="/parteneri/dashboard" className="rounded-full border border-neutral-300 text-neutral-700 px-4 py-1.5 hover:bg-neutral-50 transition text-sm">Dashboard</Link>
              <Link href="/parteneri/orders" className="rounded-full border border-neutral-300 text-neutral-700 px-4 py-1.5 hover:bg-neutral-50 transition text-sm">Comenzi</Link>
              <form action="/auth/logout" method="POST">
                <button className="rounded-full bg-black text-white px-4 py-1.5 hover:bg-neutral-800 transition text-sm">Logout</button>
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
