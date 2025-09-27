// app/parteneri/dashboard/page.tsx
import { getServerSupabase } from '../../auth/server';

export default async function PartnerDashboard() {
  const supabase = await getServerSupabase();
  const { data: catalogs, error: catalogsError } = await supabase.from('catalogs').select('*');
  const { data: pricelists, error: pricelistsError } = await supabase.from('pricelists').select('*');
  const { data: materials, error: materialsError } = await supabase.from('materials').select('*');
  const { data: orders, error: ordersError } = await supabase.from('orders').select('*');

  const totalCommission = orders?.reduce((sum, order) => sum + (order.total_gross * 0.05 || 0), 0).toFixed(2) || '0.00';

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-100">Partner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800 rounded shadow text-gray-200">
          <h2 className="text-xl font-semibold mb-2">Cataloage</h2>
          <p>{catalogsError ? catalogsError.message : JSON.stringify(catalogs)}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded shadow text-gray-200">
          <h2 className="text-xl font-semibold mb-2">Liste de Preț</h2>
          <p>{pricelistsError ? pricelistsError.message : JSON.stringify(pricelists)}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded shadow text-gray-200">
          <h2 className="text-xl font-semibold mb-2">Materiale</h2>
          <p>{materialsError ? materialsError.message : JSON.stringify(materials)}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded shadow text-gray-200">
          <h2 className="text-xl font-semibold mb-2">Termeni și Condiții</h2>
          <p>Comision standard 5% din prețul de vânzare către clientul final. Eligibilitate: comisionul se acordă când comanda e inițiată de lead-ul partenerului. Plată: lunar, la 30 zile de la livrare. (Add full terms later.)</p>
        </div>
        <div className="p-4 bg-gray-800 rounded shadow text-gray-200">
          <h2 className="text-xl font-semibold mb-2">Comenzi Mele și Comisioane</h2>
          <p>{ordersError ? ordersError.message : JSON.stringify(orders)}</p>
          <p>Total Commission: {totalCommission} RON</p>
        </div>
      </div>
    </div>
  );
}