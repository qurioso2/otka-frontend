import Link from 'next/link';

export default function SolicitaContPartener() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Solicită Cont Partener</h1>
          <p className="mt-3 text-neutral-700">Contactează-ne pentru a deveni partener OTKA și a avea acces la prețuri preferențiale.</p>
        </div>

        <div className="space-y-6">
          {/* Contact rapid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="mailto:parteneri@otka.ro?subject=Cerere%20Parteneriat%20OTKA&body=Bună%20ziua,%0A%0ADorim%20să%20devenim%20parteneri%20OTKA.%0A%0ANume%20companie:%20%0ACUI/CIF:%20%0APersoana%20de%20contact:%20%0AEmail:%20%0ATelefon:%20%0ATipul%20activității:%20%0A%0AVă%20mulțumim!"
              className="flex items-center justify-center gap-3 rounded-xl bg-black text-white px-6 py-4 hover:bg-neutral-800 transition"
            >
              <span className="text-xl">📧</span>
              <div className="text-left">
                <div className="font-semibold">Trimite Email</div>
                <div className="text-sm opacity-90">parteneri@otka.ro</div>
              </div>
            </a>
            <a 
              href="tel:+40123456789"
              className="flex items-center justify-center gap-3 rounded-xl border-2 border-neutral-900 text-neutral-900 px-6 py-4 hover:bg-neutral-900 hover:text-white transition"
            >
              <span className="text-xl">📞</span>
              <div className="text-left">
                <div className="font-semibold">Sună Acum</div>
                <div className="text-sm opacity-70">+40 123 456 789</div>
              </div>
            </a>
          </div>

          <div className="bg-neutral-50 rounded-xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">📋 Informații Necesare</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-700">
              <div>
                <p><strong>Date Companie:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Nume companie</li>
                  <li>CUI/CIF</li>
                  <li>Adresa completă</li>
                </ul>
              </div>
              <div>
                <p><strong>Date Contact:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Persoana de contact</li>
                  <li>Email</li>
                  <li>Telefon</li>
                  <li>Tipul activității</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💼 Beneficii Parteneriat</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>✅ Prețuri nete preferențiale pentru parteneri</p>
              <p>✅ Acces la liste de prețuri actualizate</p>
              <p>✅ Materiale promoționale și cataloage</p>
              <p>✅ Sistem de comenzi simplificat</p>
              <p>✅ Suport tehnic dedicat</p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 text-neutral-700 px-6 py-3 text-base font-medium hover:bg-neutral-50 transition"
            >
              Am deja cont - Login
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="text-center text-sm text-neutral-600">
            <p className="mb-2">📧 <strong>Email:</strong> <a href="mailto:parteneri@otka.ro" className="text-neutral-900 underline">parteneri@otka.ro</a></p>
            <p className="mb-2">📞 <strong>Telefon:</strong> <a href="tel:+40123456789" className="text-neutral-900 underline">+40 123 456 789</a></p>
            <p>Procesarea cererilor durează 1-2 zile lucrătoare. Veți fi contactați pentru următorii pași.</p>
          </div>
        </div>
      </div>
    </div>
  );
}