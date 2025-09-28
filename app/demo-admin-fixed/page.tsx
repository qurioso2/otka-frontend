// Demo dashboard admin cu toate corecțiile de contrast
import UsersAdmin from "../admin/UsersAdmin";
import ClientsAdmin from "../admin/ClientsAdmin";
import CommissionSummary from "../admin/CommissionSummary";

export default function DemoAdminFixed() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-lg mb-6 mx-6">
        <h1 className="text-xl font-bold">🎨 DEMO: Probleme Contrast REZOLVATE!</h1>
        <p className="text-sm font-semibold mt-1">
          Toate textele au fost corectate cu contrast înalt, fonturi bold, bordere vizibile și culori clare.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white rounded-2xl border-2 border-gray-400 shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin OTKA - Contrast Corectat</h1>
          <p className="text-lg font-semibold text-gray-800">
            Toate componentele au fost actualizate cu:
          </p>
          <ul className="mt-3 space-y-1 text-sm font-bold text-gray-800">
            <li>✅ Texte cu contrast înalt (font-bold, culori închise)</li>
            <li>✅ Bordere vizibile (border-2, culori mai închise)</li>
            <li>✅ Fonturi mai groase pentru lizibilitate</li>
            <li>✅ Culori clare pentru diferențiere</li>
            <li>✅ Shadow-uri pentru separare vizuală</li>
          </ul>
        </div>

        <UsersAdmin />
        <ClientsAdmin />
        <CommissionSummary />
      </div>
    </div>
  );
}