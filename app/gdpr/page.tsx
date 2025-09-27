import LegalContainer from "../ui/LegalContainer";

export const dynamic = 'force-static';

export default function GDPR() {
  const today = new Date().toLocaleDateString('ro-RO');
  return (
    <LegalContainer title="POLITICA DE CONFIDENȚIALITATE (GDPR/RGPD)">
      <p><em>Ultima actualizare: {today}</em></p>

      <h3 className="text-xl font-medium text-neutral-900">Informații despre Administrator</h3>
      <p><strong>Administratorul datelor cu caracter personal:</strong><br />
      Denumire: MERCURY VC S.R.L.<br />
      CIF: RO48801623<br />
      Sediul: Cluj-Napoca, România<br />
      Site: <a href="https://otka.ro" className="underline">https://otka.ro</a><br />
      Email: <a href="mailto:contact@otka.ro" className="underline">contact@otka.ro</a><br />
      Telefon: [Numărul de telefon]</p>

      <p><strong>Autoritatea de supraveghere:</strong> ANSPDCP<br />
      Site: <a href="https://dataprotection.ro" className="underline">dataprotection.ro</a><br />
      Email: <a href="mailto:anspdcp@dataprotection.ro" className="underline">anspdcp@dataprotetection.ro</a></p>

      <h3 className="text-xl font-medium text-neutral-900">Categorii de Date Personale Prelucrate</h3>
      <ul className="list-disc pl-6">
        <li>Comenzi și livrări: identificare, contact, facturare, istoric</li>
        <li>Funcționare site: cookies, IP, browser, utilizare</li>
        <li>Servicii suplimentare: montaj, suport clienți, recenzii</li>
      </ul>

      <h3 className="text-xl font-medium text-neutral-900">Scopuri și Baze Legale</h3>
      <ol className="list-decimal pl-6">
        <li><strong>Executarea contractului</strong> (Art. 6(1)(b) GDPR)</li>
        <li><strong>Obligație legală</strong> (Art. 6(1)(c) GDPR)</li>
        <li><strong>Consimțământ</strong> (Art. 6(1)(a) GDPR)</li>
        <li><strong>Interes legitim</strong> (Art. 6(1)(f) GDPR)</li>
      </ol>

      <h3 className="text-xl font-medium text-neutral-900">Perioada de păstrare</h3>
      <ul className="list-disc pl-6">
        <li>Date contractuale: 10 ani</li>
        <li>Marketing: până la retragerea consimțământului sau 3 ani</li>
        <li>Navigare: 13 luni analitice, 6 luni securitate</li>
        <li>Reclamații/litigii: 5 ani</li>
      </ul>

      <h3 className="text-xl font-medium text-neutral-900">Destinatari și transferuri</h3>
      <ul className="list-disc pl-6">
        <li>Procesatori plăți, curierat, IT, montaj, autorități</li>
        <li>Transferuri internaționale doar cu garanții adecvate (SCC/adecvare)</li>
      </ul>

      <h3 className="text-xl font-medium text-neutral-900">Drepturile Dvs.</h3>
      <ul className="list-disc pl-6">
        <li>Acces, rectificare, ștergere, restricționare, portabilitate, opoziție</li>
        <li>Plângere la ANSPDCP</li>
      </ul>

      <h3 className="text-xl font-medium text-neutral-900">Măsuri de securitate</h3>
      <ul className="list-disc pl-6">
        <li>Criptare în tranzit/repus, control acces, monitorizare, backup, training</li>
      </ul>

      <h3 className="text-xl font-medium text-neutral-900">Modificări</h3>
      <p>Politica poate fi actualizată. Vom notifica modificările semnificative.</p>
    </LegalContainer>
  );
}
