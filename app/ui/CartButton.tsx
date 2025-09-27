'use client';
import Link from 'next/link';
import { useCart } from './cart/CartProvider';

export default function CartButton() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative rounded-full bg-black text-white px-4 py-1.5 hover:bg-neutral-800 transition text-sm">
      Cos {count > 0 && (
        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-white text-black text-xs w-5 h-5">{count}</span>
      )}
    </Link>
  );
}
