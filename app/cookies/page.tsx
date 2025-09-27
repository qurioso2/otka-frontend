import LegalContainer from "../ui/LegalContainer";

export const dynamic = 'force-static';

export default function Cookies() {
  const today = new Date().toLocaleDateString('ro-RO');
  return (
    <LegalContainer title="POLITICA DE COOKIES">
      <p><em>Ultima actualizare: {today}</em></p>
      <h2 className="text-xl font-medium text-neutral-900">Ce sunt cookie-urile?</h2>
      <p>Cookie-urile sunt fișiere text stocate pe dispozitivul dvs. și ne ajută să îmbunătățim experiența pe site.</p>

      <h2 className="text-xl font-medium text-neutral-900">Tipuri de cookie-uri</h2>
      <ul className="list-disc pl-6">
        <li>Strict necesare – funcționare coș, sesiune, securitate</li>
        <li>Analiză – trafic și performanță (cu consimțământ)</li>
        <li>Marketing – publicitate (cu consimțământ)</li>
        <li>Funcționalitate – preferințe</li>
      </ul>
      <h2 className="text-xl font-medium text-neutral-900">Administrare</h2>
      <p>Puteți gestiona preferințele în browser sau prin setările de pe site.</p>
      <h2 className="text-xl font-medium text-neutral-900">Retragerea consimțământului</h2>
      <p>Oricând, prin ștergerea cookie-urilor sau modificarea setărilor.</p>
      <p>Contact: contact@otka.ro</p>
    </LegalContainer>
  );
}
