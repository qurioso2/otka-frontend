import { supabase } from "../../lib/supabaseClient";

export default async function DebugPage() {
  try {
    const { data: products, error } = await supabase
      .from("products_public")
      .select("id,sku,name,slug,price_public_ttc,stock_qty,gallery")
      .order("id", { ascending: false })
      .limit(5);

    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600">Eroare Supabase</h1>
          <pre className="bg-red-50 p-4 rounded mt-4">{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Debug Page - Supabase OK</h1>
        <p>Produse găsite: {products?.length || 0}</p>
        <div className="mt-4 bg-green-50 p-4 rounded">
          <pre>{JSON.stringify(products?.[0] || {}, null, 2)}</pre>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Eroare Catch</h1>
        <pre className="bg-red-50 p-4 rounded mt-4">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}