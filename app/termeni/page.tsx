import LegalContainer from "../ui/LegalContainer";

export const dynamic = 'force-static';

export default function Termeni() {
  const today = new Date().toLocaleDateString('ro-RO');
  return (
    <LegalContainer title="TERMENI ȘI CONDIȚII DE VÂNZARE">
      <p><em>Ultima actualizare: {today}</em></p>

      <h2 className="text-xl font-medium text-neutral-900">1. INFORMAȚII DESPRE VÂNZĂTOR</h2>
      <p>MERCURY VC S.R.L. | CIF: RO48801623 | Cluj-Napoca, România | Email: contact@otka.ro | Site: https://otka.ro</p>

      <h2 className="text-xl font-medium text-neutral-900">2. DEFINIȚII</h2>
      <p>Produse resigilate/expuse, Consumator, Contract la distanță, Zi lucrătoare.</p>

      <h2 className="text-xl font-medium text-neutral-900">3. PRODUSE</h2>
      <ul className="list-disc pl-6">
        <li>Resigilate/expuse, urme estetice minore, funcționalitate 100%.</li>
        <li>Stare descrisă în fișa produsului; fotografii reale.</li>
      </ul>

      <h2 className="text-xl font-medium text-neutral-900">4. PREȚURI ȘI PLĂȚI</h2>
      <ul className="list-disc pl-6">
        <li>Prețurile includ TVA; pot fi actualizate.</li>
        <li>Livrare afișată înainte de finalizare; montaj separat.</li>
        <li>Plată: card/transfer/ramburs (unde disponibil).</li>
      </ul>

      <h2 className="text-xl font-medium text-neutral-900">5. COMANDA</h2>
      <ul className="list-disc pl-6">
        <li>Contractul se încheie la confirmarea prin email.</li>
        <li>Erori evidente de preț/descriere: contact, altfel anulare în 48h.</li>
      </ul>

      <h2 className="text-xl font-medium text-neutral-900">6. LIVRAREA</h2>
      <ul className="list-disc pl-6">
        <li>România prin curier; 2-5 zile lucrătoare uzual.</li>
        <li>Riscul la livrare; proprietatea după plata integrală.</li>
      </ul>

      <h2 className="text-xl font-medium text-neutral-900">7. RETRAGERE</h2>
      <ul className="list-disc pl-6">
        <li>14 zile, produs în stare inițială; ramburs în 14 zile.</li>
        <li>Excepții: personalizate, deteriorate nejustificat etc.</li>
      </ul>

      <h2 className="text-xl font-medium text-neutral-900">8. GARANȚIE</h2>
      <ul className="list-disc pl-6">
        <li>Conformitate 2 ani; remedii: reparare/înlocuire/reducere/rezoluțiune.</li>
      </ul>

      <h2 className="text-xl font-medium text-neutral-900">9. RECLAMAȚII/LITIGII</h2>
      <ul className="list-disc pl-6">
        <li>Reclamații: contact@otka.ro (max 30 zile răspuns).</li>
        <li>SAL/ODR/instanțe; lege română.</li>
      </ul>

      <h2 className="text-xl font-medium text-neutral-900">10. DATE PERSONALE</h2>
      <p>Prelucrarea conform Politicii de Confidențialitate.</p>

      <h2 className="text-xl font-medium text-neutral-900">11. MODIFICAREA TERMENILOR</h2>
      <p>Notificare 15 zile; nu afectează comenzile plasate.</p>

      <h2 className="text-xl font-medium text-neutral-900">12. DISPOZIȚII FINALE</h2>
      <p>Clauze nule nu afectează restul; Cod Civil, OUG 34/2014.</p>
    </LegalContainer>
  );
}
