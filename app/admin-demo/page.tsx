// Pagină demo pentru dashboard admin (fără autentificare) - pentru testarea contrastelor
import AdminDashboard from "../admin/AdminDashboard";

export default function AdminDemo() {
  return (
    <div>
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-4 mx-4">
        <p className="font-bold">🚧 Demo Dashboard Admin</p>
        <p className="text-sm">Această pagină demonstrează dashboard-ul admin fără autentificare pentru testarea contrastelor și design-ului.</p>
      </div>
      <AdminDashboard />
    </div>
  );
}