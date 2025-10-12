'use client';
import { useCart } from './cart/CartProvider';

export default function AddToCartButton({ item }: { item: { id: number; sku: string; name: string; price: number; image?: string | null; stock_qty?: number } }) {
  const { add } = useCart();
  const isOutOfStock = !item.stock_qty || item.stock_qty <= 0;
  
  return (
    <button 
      onClick={() => add(item, 1)} 
      disabled={isOutOfStock}
      className={`mt-3 w-full rounded-full px-4 py-2 text-sm transition ${
        isOutOfStock 
          ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' 
          : 'bg-black text-white hover:bg-neutral-800'
      }`}
    >
      {isOutOfStock ? 'Stoc epuizat' : 'Adaugă în coș'}
    </button>
  );
}
