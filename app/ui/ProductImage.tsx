'use client';

import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function ProductImage({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/images/product-placeholder.jpg' 
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-500 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div>Imagine indisponibilă</div>
          </div>
        </div>
      )}
    </div>
  );
}