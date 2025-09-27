export const dynamic = 'force-static';

export default function Cookies() {
  const today = new Date().toLocaleDateString('ro-RO');
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 prose prose-neutral">
      <h1>POLITICA DE COOKIES</h1>
      <p><em>Ultima actualizare: {today}</em></p>
      <h2>Ce sunt cookie-urile?</h2>
      <p>Cookie-urile sunt fișiere text stocate pe dispozitivul dvs. și ne ajută să îmbunătățim experiența pe site.</p>
      <h2>Tipuri de cookie-uri</h2>
      <ul>
        <li>Strict necesare – funcționare coș, sesiune, securitate</li>
        <li>Analiză – trafic și performanță (cu consimțământ)</li>
        <li>Marketing – publicitate (cu consimțământ)</li>
        <li>Funcționalitate – preferințe</li>
      </ul>
      <h2>Administrare</h2>
      <p>Puteți gestiona preferințele în browser sau prin setările de pe site.</p>
      <h2>Retragerea consimțământului</h2>
      <p>Oricând, prin ștergerea cookie-urilor sau modificarea setărilor.</p>
      <p>Contact: contact@otka.ro</p>
    </div>
  );
}
