'use client';
import { useCart } from './cart/CartProvider';

export default function AddToCartButton({ item }: { item: { id: number; sku: string; name: string; price: number; image?: string | null } }) {
  const { add } = useCart();
  return (
    <button onClick={() => add(item, 1)} className="mt-3 w-full rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-neutral-800 transition">Adaugă în coș</button>
  );
}
