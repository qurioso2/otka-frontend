export default function ContractCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h3 className="text-lg font-medium text-neutral-900">Contract de Comision (Parteneri)</h3>
      <p className="mt-2 text-sm text-neutral-700">Comision standard 5% din prețul de vânzare (fără TVA). Plata: până la data de 15 a lunii următoare, pe baza facturilor emise.</p>
      <a href="/contract-partener.html" target="_blank" className="mt-3 inline-flex rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800">Descarcă Contract</a>
    </div>
  );
}
