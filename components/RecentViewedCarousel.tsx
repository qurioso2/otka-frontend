'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentlyViewed, type RecentProduct } from '@/lib/recentViewed';
import ProductImage from '@/app/ui/ProductImage';

interface RecentViewedCarouselProps {
  currentProductId?: number;
}

export default function RecentViewedCarousel({ currentProductId }: RecentViewedCarouselProps) {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const products = getRecentlyViewed();
    // Filter out current product
    const filtered = currentProductId 
      ? products.filter(p => p.id !== currentProductId)
      : products;
    setRecentProducts(filtered);
  }, [currentProductId]);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-neutral-200 pt-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Recent vizualizate</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            href={`/p/${product.slug}`}
            className="group block"
          >
            <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden mb-2">
              <ProductImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 group-hover:text-neutral-600">
              {product.name}
            </h3>
            <p className="text-sm font-semibold text-neutral-900 mt-1">
              {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
