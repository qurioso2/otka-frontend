import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

interface ProductPublic {
  id: number;
  sku: string;
  name: string;
  slug: string;
  price_public_ttc: number;
  price_original?: number;
  stock_qty: number;
  gallery: unknown[] | null;
}

export default async function SimpleHome() {
  const { data: products, error } = await supabase
    .from("products_public")
    .select("id,sku,name,slug,price_public_ttc,stock_qty,gallery")
    .order("id", { ascending: false })
    .limit(6);

  const rows: ProductPublic[] = (products as ProductPublic[] | null) ?? [];

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Eroare</h1>
        <pre className="bg-red-50 p-4 rounded mt-4">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">OTKA - Mobilier & Design</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.map((product) => {
          const img = Array.isArray(product.gallery) && product.gallery.length > 0 
            ? String(product.gallery[0]) 
            : '/images/product-placeholder.jpg';
            
          return (
            <div key={product.id} className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
              <div className="aspect-[4/3] bg-neutral-50 overflow-hidden">
                <img 
                  src={img} 
                  alt={product.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="text-sm text-neutral-600 mb-2">SKU: {product.sku}</div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold">
                    {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(product.price_public_ttc || 0)}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    product.stock_qty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_qty > 0 ? `În stoc (${product.stock_qty})` : 'Epuizat'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}