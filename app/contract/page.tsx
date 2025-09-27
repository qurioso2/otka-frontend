export const dynamic = 'force-static';

export default function Contract() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 prose prose-neutral">
      <h1>Contract Parteneri</h1>
      <p>Acesta este un template. Descărcați versiunea HTML și o puteți converti în PDF:</p>
      <ul>
        <li><a className="underline" href="/contract-partener.html" download>Descarcă Contract (HTML)</a></li>
      </ul>
      <p>Dacă doriți, adaug integrare pentru generarea PDF automat (pdf-lib) și salvare în R2.</p>
    </div>
  );
}
