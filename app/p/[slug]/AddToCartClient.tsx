'use client';
import AddToCartButton from '../../ui/AddToCartButton';

export default function AddToCartClient({ item }: { item: { id: number; sku: string; name: string; price: number; image?: string | null } }) {
  return <AddToCartButton item={item} />;
}
