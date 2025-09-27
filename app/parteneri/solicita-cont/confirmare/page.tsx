import Link from 'next/link';

export default function ConfirmareSolicitare() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <div className="text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">Cererea a fost trimisă cu succes!</h1>
        <p className="text-lg text-neutral-700 mb-8">
          Mulțumim pentru interesul acordat programului de parteneriat OTKA. 
          Cererea dumneavoastră va fi evaluată în 1-2 zile lucrătoare.
        </p>
        
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">Ce urmează?</h3>
          <div className="text-left text-blue-800 space-y-2">
            <p>📧 Veți primi un email de confirmare la adresa indicată</p>
            <p>👥 Echipa noastră va evalua cererea în max 48h</p>
            <p>🔑 La aprobare, veți primi credențialele de acces</p>
            <p>💼 Accesul la prețuri preferențiale și materiale exclusive</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            href="/" 
            className="inline-block rounded-full bg-black text-white px-6 py-3 text-base font-medium hover:bg-neutral-800 transition"
          >
            Înapoi la Homepage
          </Link>
          <div>
            <Link 
              href="/login" 
              className="text-neutral-600 hover:text-neutral-900 underline"
            >
              Am deja cont - Login
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 text-sm text-neutral-600">
          <p className="mb-2">
            <strong>Întrebări?</strong> Contactează-ne la{' '}
            <a href="mailto:parteneri@otka.ro" className="text-neutral-900 underline">
              parteneri@otka.ro
            </a>
          </p>
          <p>Sau sună-ne la <strong>+40 123 456 789</strong> (L-V, 9:00-17:00)</p>
        </div>
      </div>
    </div>
  );
}