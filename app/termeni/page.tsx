export default function Termeni() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 prose prose-neutral">
      <h1>Termeni & Comisioane</h1>
      <p>Acesta este un draft editabil. Spuneți exact ce modificări doriți și le aplic.</p>
      <h2>Eligibilitate comision</h2>
      <ul>
        <li>Comisionul standard: 5% din prețul de vânzare către clientul final.</li>
        <li>Eligibil când comanda este inițiată de lead-ul partenerului și aprobată.</li>
        <li>Se calculează la valoarea netă, după discounturi aplicate clientului final.</li>
      </ul>
      <h2>Plată</h2>
      <ul>
        <li>Plata comisioanelor se face lunar, în 30 de zile de la livrare.</li>
        <li>Factura pentru comision trebuie emisă în termen de 5 zile lucrătoare de la confirmare.</li>
      </ul>
      <h2>Excluderi</h2>
      <ul>
        <li>Returnări sau comenzi anulate nu generează comision.</li>
        <li>Comenzi interne sau auto-cumpărări nu sunt eligibile.</li>
      </ul>
      <p>Trimiteți modificările dorite (procente, termene, excepții) și actualizez textul.</p>
    </div>
  );
}
