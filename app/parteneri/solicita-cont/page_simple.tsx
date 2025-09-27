import Link from 'next/link';

export default function SolicitaContPartener() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Solicită Cont Partener</h1>
          <p className="mt-3 text-neutral-700">Completează formularul pentru a deveni partener OTKA și a avea acces la prețuri preferențiale.</p>
        </div>

        <form action="/api/partners/register" method="POST" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                Nume Companie *
              </label>
              <input 
                type="text" 
                name="company_name"
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900" 
                placeholder="SC Exemplu SRL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                CUI/CIF *
              </label>
              <input 
                type="text" 
                name="vat_id"
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900" 
                placeholder="RO12345678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                Nume Contact *
              </label>
              <input 
                type="text" 
                name="contact_name"
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900" 
                placeholder="Popescu Ion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                Email *
              </label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900" 
                placeholder="contact@company.ro"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                Telefon
              </label>
              <input 
                type="tel" 
                name="phone"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900" 
                placeholder="+40 123 456 789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-2">
                Tip Activitate
              </label>
              <select 
                name="business_type"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Selectează...</option>
                <option value="retail">Retail</option>
                <option value="distribuitor">Distribuitor</option>
                <option value="integrator">Integrator IT</option>
                <option value="service">Service</option>
                <option value="alte">Alte</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-2">
              Adresa Completă
            </label>
            <textarea 
              name="address"
              rows={3}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" 
              placeholder="Strada, numărul, oraș, județ, cod poștal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-2">
              Volumul anual aproximativ de achiziții (RON)
            </label>
            <select 
              name="annual_volume"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Selectează...</option>
              <option value="10000-50000">10.000 - 50.000 RON</option>
              <option value="50000-100000">50.000 - 100.000 RON</option>
              <option value="100000-500000">100.000 - 500.000 RON</option>
              <option value="500000+">Peste 500.000 RON</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-2">
              Motivația colaborării (opțional)
            </label>
            <textarea 
              name="motivation"
              rows={4}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none" 
              placeholder="De ce doriți să deveniți partener OTKA? Ce produse vă interesează în principal?"
            />
          </div>

          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                name="accept_terms" 
                id="accept_terms"
                required
                className="mt-1"
              />
              <label htmlFor="accept_terms" className="text-sm text-neutral-700">
                Accept <Link href="/termeni" className="underline text-neutral-900">termenii și condițiile</Link> și <Link href="/gdpr" className="underline text-neutral-900">politica de confidențialitate</Link> OTKA. Sunt de acord cu prelucrarea datelor personale în scopul evaluării cererii de parteneriat.
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              type="submit" 
              className="flex-1 rounded-full bg-black text-white px-6 py-3 text-base font-medium hover:bg-neutral-800 transition"
            >
              Trimite Cererea
            </button>
            <Link 
              href="/login" 
              className="flex-1 text-center rounded-full border border-neutral-300 text-neutral-700 px-6 py-3 text-base font-medium hover:bg-neutral-50 transition"
            >
              Am deja cont
            </Link>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="text-center text-sm text-neutral-600">
            <p className="mb-2">📞 <strong>Întrebări?</strong> Contactează-ne la <a href="mailto:parteneri@otka.ro" className="text-neutral-900 underline">parteneri@otka.ro</a></p>
            <p>Procesarea cererilor durează 1-2 zile lucrătoare. Vei primi un email cu statusul cererii.</p>
          </div>
        </div>
      </div>
    </div>
  );
}