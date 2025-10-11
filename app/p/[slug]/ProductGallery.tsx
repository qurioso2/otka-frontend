'use client';
import { useState, useEffect } from 'react';
import ProductImage from '@/app/ui/ProductImage';
import ImageModal from '@/components/ImageModal';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(images[0] || '');

  // Update current image when selectedImage changes
  useEffect(() => {
    if (images[selectedImage]) {
      setCurrentImage(images[selectedImage]);
    }
  }, [selectedImage, images]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center">
        <span className="text-neutral-400">No image</span>
      </div>
    );
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index);
  };

  const handleImageChangeFromModal = (index: number) => {
    setSelectedImage(index);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image - Clickable */}
        <div 
          className="aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-zoom-in group relative"
          onClick={() => setIsModalOpen(true)}
        >
          <ProductImage
            key={currentImage}
            src={currentImage}
            alt={productName}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {/* Zoom indicator */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-full text-sm font-medium">
              Click pentru imagine mare
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleThumbnailClick(idx)}
                className={`aspect-square bg-neutral-100 rounded-lg overflow-hidden border-2 transition ${
                  idx === selectedImage
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <ProductImage
                  src={img}
                  alt={`${productName} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={images}
        currentIndex={selectedImage}
        productName={productName}
        onImageChange={handleImageChangeFromModal}
      />
    </>
  );
}
