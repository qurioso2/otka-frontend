import Link from "next/link";

export default function ParteneriLanding() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Parteneri OTKA</h1>
      <p className="mt-4 text-neutral-600">Partenerii înregistrați pot vizualiza prețurile nete, materiale și cataloage. Autentificarea se face cu email și parolă.</p>
      <div className="mt-8 flex items-center gap-4">
        <Link href="/login" className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition">Login</Link>
        <a href="#" className="text-neutral-700 hover:opacity-70">Solicită cont</a>
      </div>
    </div>
  );
}
