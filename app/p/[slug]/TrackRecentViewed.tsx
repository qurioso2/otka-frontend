'use client';
import { useEffect } from 'react';
import { addRecentlyViewed } from '@/lib/recentViewed';

interface TrackRecentViewedProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    image: string;
  };
}

export default function TrackRecentViewed({ product }: TrackRecentViewedProps) {
  useEffect(() => {
    // Add to recent viewed after 2 seconds (user actually viewed the page)
    const timeout = setTimeout(() => {
      addRecentlyViewed(product);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [product]);

  return null;
}
