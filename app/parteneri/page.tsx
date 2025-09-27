import Link from "next/link";

export default function ParteneriLanding() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-semibold tracking-tight text-neutral-900">Programul de Parteneriat OTKA</h1>
        <p className="mt-6 text-xl text-neutral-700 max-w-3xl mx-auto">Conectează-te cu rețeaua noastră de profesioniști din design interior, arhitectură și amenajări. Beneficiază de prețuri speciale la mobilier, corpuri de iluminat și obiecte decorative.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 rounded-2xl bg-neutral-50">
          <div className="text-4xl mb-4">🛋️</div>
          <h3 className="font-semibold text-lg mb-2">Mobilier Design</h3>
          <p className="text-sm text-neutral-600">Canapele, fotolii, mese, scaune - colecție completă pentru orice stil de amenajare</p>
        </div>
        <div className="text-center p-6 rounded-2xl bg-neutral-50">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="font-semibold text-lg mb-2">Corpuri de Iluminat</h3>
          <p className="text-sm text-neutral-600">Lustre, aplice, spoturi, LED-uri - soluții complete de iluminat interior</p>
        </div>
        <div className="text-center p-6 rounded-2xl bg-neutral-50">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="font-semibold text-lg mb-2">Obiecte Decorative</h3>
          <p className="text-sm text-neutral-600">Accesorii, textile, oglinzi, tablouri - detaliile care fac diferența</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Beneficiile Programului</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">💰 Prețuri Preferențiale</h3>
            <p className="text-sm text-neutral-600 mb-4">Reduceri substanțiale față de prețurile publice pentru toți partenerii verificați</p>
            
            <h3 className="font-medium mb-3">📚 Cataloage Exclusive</h3>
            <p className="text-sm text-neutral-600">Acces la catalogul complet cu specificații tehnice și imagini de înaltă calitate</p>
          </div>
          <div>
            <h3 className="font-medium mb-3">🤝 Suport Dedicat</h3>
            <p className="text-sm text-neutral-600 mb-4">Consultant personal pentru proiecte mari și recomandări tehnice</p>
            
            <h3 className="font-medium mb-3">🚚 Condiții Speciale Livrare</h3>
            <p className="text-sm text-neutral-600">Transport prioritar și soluții logistice pentru proiectele complexe</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="rounded-full bg-black text-white px-8 py-3 text-base font-medium hover:bg-neutral-800 transition">Acces Parteneri</Link>
          <Link href="/parteneri/solicita-cont" className="rounded-full border-2 border-neutral-900 text-neutral-900 px-8 py-3 text-base font-medium hover:bg-neutral-900 hover:text-white transition">Solicită Parteneriat</Link>
        </div>
        <p className="mt-4 text-sm text-neutral-600">Partenerii au acces la prețuri nete, materiale și sistemul de comenzi</p>
      </div>
    </div>
  );
}
