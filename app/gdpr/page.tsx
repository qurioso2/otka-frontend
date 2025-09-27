export const dynamic = 'force-static';

export default function GDPR() {
  const today = new Date().toLocaleDateString('ro-RO');
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 prose prose-neutral">
      <h2>POLITICA DE CONFIDENȚIALITATE (GDPR/RGPD)</h2>
      <p><em>Ultima actualizare: {today}</em></p>

      <h3>Informații despre Administrator</h3>
      <p><strong>Administratorul datelor cu caracter personal:</strong><br />
      Denumire: MERCURY VC S.R.L.<br />
      CIF: RO48801623<br />
      Sediul: Cluj-Napoca, România<br />
      Site: <a href="https://otka.ro">https://otka.ro</a><br />
      Email: <a href="mailto:contact@otka.ro">contact@otka.ro</a><br />
      Telefon: [Numărul de telefon]</p>

      <p><strong>Autoritatea de supraveghere:</strong> ANSPDCP<br />
      Site: <a href="https://dataprotection.ro">dataprotection.ro</a><br />
      Email: <a href="mailto:anspdcp@dataprotection.ro">anspdcp@dataprotection.ro</a></p>

      <h3>Categorii de Date Personale Prelucrate</h3>
      <ul>
        <li>Comenzi și livrări: identificare, contact, facturare, istoric</li>
        <li>Funcționare site: cookies, IP, browser, utilizare</li>
        <li>Servicii suplimentare: montaj, suport clienți, recenzii</li>
      </ul>

      <h3>Scopuri și Baze Legale</h3>
      <ol>
        <li><strong>Executarea contractului</strong> (Art. 6(1)(b) GDPR)</li>
        <li><strong>Obligație legală</strong> (Art. 6(1)(c) GDPR)</li>
        <li><strong>Consimțământ</strong> (Art. 6(1)(a) GDPR)</li>
        <li><strong>Interes legitim</strong> (Art. 6(1)(f) GDPR)</li>
      </ol>

      <h3>Perioada de păstrare</h3>
      <ul>
        <li>Date contractuale: 10 ani</li>
        <li>Marketing: până la retragerea consimțământului sau 3 ani</li>
        <li>Navigare: 13 luni analitice, 6 luni securitate</li>
        <li>Reclamații/litigii: 5 ani</li>
      </ul>

      <h3>Destinatari și transferuri</h3>
      <ul>
        <li>Procesatori plăți, curierat, IT, montaj, autorități</li>
        <li>Transferuri internaționale doar cu garanții adecvate (SCC/adecvare)</li>
      </ul>

      <h3>Drepturile Dvs.</h3>
      <ul>
        <li>Acces, rectificare, ștergere, restricționare, portabilitate, opoziție</li>
        <li>Plângere la ANSPDCP</li>
      </ul>

      <h3>Măsuri de securitate</h3>
      <ul>
        <li>Criptare în tranzit/repus, control acces, monitorizare, backup, training</li>
      </ul>

      <h3>Modificări</h3>
      <p>Politica poate fi actualizată. Vom notifica modificările semnificative.</p>
    </div>
  );
}
