export const dynamic = 'force-static';

export default function Termeni() {
  const today = new Date().toLocaleDateString('ro-RO');
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 prose prose-neutral">
      <h1>TERMENI ȘI CONDIȚII DE VÂNZARE</h1>
      <p><em>Ultima actualizare: {today}</em></p>

      <h2>1. INFORMAȚII DESPRE VÂNZĂTOR</h2>
      <p>Denumire: MERCURY VC S.R.L. | CIF: RO48801623 | Sediul: Cluj-Napoca, România<br />
      Email: contact@otka.ro | Site: https://otka.ro</p>

      <h2>2. DEFINIȚII</h2>
      <p>Produse resigilate/expuse, Consumator, Contract la distanță, Zi lucrătoare.</p>

      <h2>3. PRODUSE</h2>
      <ul>
        <li>Resigilate/expuse, pot avea urme estetice minore, funcționalitate 100%.</li>
        <li>Starea produsului este descrisă în fișa individuală; fotografii reale.</li>
      </ul>

      <h2>4. PREȚURI ȘI PLĂȚI</h2>
      <ul>
        <li>Prețurile includ TVA; pot fi actualizate.</li>
        <li>Livrarea este afișată înainte de finalizare; montajul separat.</li>
        <li>Plată: card/transfer/ramburs (unde disponibil).</li>
      </ul>

      <h2>5. COMANDA</h2>
      <ul>
        <li>Contractul se încheie la confirmarea prin email.</li>
        <li>Erori evidente de preț/descriere: vă contactăm; altfel, anulare în 48h.</li>
      </ul>

      <h2>6. LIVRAREA</h2>
      <ul>
        <li>România prin curier; 2-5 zile lucrătoare uzual.</li>
        <li>Riscul la livrare; proprietatea după plata integrală.</li>
      </ul>

      <h2>7. RETRAGERE</h2>
      <ul>
        <li>14 zile, produs în stare inițială; ramburs în 14 zile.</li>
        <li>Excepții: personalizate, deteriorate nejustificat etc.</li>
      </ul>

      <h2>8. GARANȚIE</h2>
      <ul>
        <li>Legală de conformitate 2 ani; remedii: reparare/înlocuire/reducere/rezoluțiune.</li>
      </ul>

      <h2>9. RECLAMAȚII/LITIGII</h2>
      <ul>
        <li>Reclamații: contact@otka.ro (max 30 zile răspuns).</li>
        <li>SAL/ODR/instanțe competente; lege română.</li>
      </ul>

      <h2>10. DATE PERSONALE</h2>
      <p>Prelucrarea conform Politicii de Confidențialitate.</p>

      <h2>11. MODIFICAREA TERMENILOR</h2>
      <p>Notificare prealabilă 15 zile; nu afectează comenzile plasate.</p>

      <h2>12. DISPOZIȚII FINALE</h2>
      <p>Clauze nule nu afectează restul; se aplică Codul Civil, OUG 34/2014.</p>
    </div>
  );
}
