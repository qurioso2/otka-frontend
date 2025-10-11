'use client';

import { useState, useRef } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload?: (files: FileList) => Promise<string[]>;
  maxImages?: number;
}

export default function GalleryManager({ 
  images, 
  onChange, 
  onUpload,
  maxImages = 10 
}: GalleryManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(index, 0, draggedImage);
    
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} imagini permise`);
      return;
    }

    if (onUpload) {
      setUploading(true);
      try {
        const uploadedUrls = await onUpload(files);
        onChange([...images, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} imagini încărcate`);
      } catch (error: any) {
        toast.error(error.message || 'Eroare la upload');
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Imagine ștearsă');
  };

  return (
    <div className="space-y-4" data-testid="gallery-manager">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-violet-400 transition">
        <input
          ref={fileInputRef}
          type="file"
          id="gallery-upload"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        
        <label
          htmlFor="gallery-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
              <p className="text-sm font-medium text-neutral-700">Se încarcă...</p>
            </>
          ) : (
            <>
              <Upload className="text-violet-400" size={40} />
              <div>
                <p className="text-sm font-bold text-neutral-900 mb-1">
                  Click pentru a încărca imagini
                </p>
                <p className="text-xs text-neutral-600">
                  JPG, PNG, WebP • Max {maxImages} imagini • {images.length}/{maxImages} folosite
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-neutral-900">
              Imagini Galerie ({images.length})
            </h4>
            <p className="text-xs text-neutral-600">
              Trage și plasează pentru a reordona
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-xl overflow-hidden border-2 ${
                  draggedIndex === index
                    ? 'border-violet-600 opacity-50'
                    : 'border-neutral-200 hover:border-violet-300'
                } transition cursor-move`}
                data-testid={`gallery-item-${index}`}
              >
                {/* Image */}
                <div className="aspect-square bg-neutral-100">
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>

                {/* Overlay with controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2">
                  {/* Drag Handle */}
                  <div className="opacity-0 group-hover:opacity-100 transition p-2 bg-white/90 rounded-lg cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} className="text-neutral-700" />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 transition p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    title="Șterge imagine"
                    data-testid={`remove-image-${index}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Index Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-violet-600 text-white text-xs font-bold rounded-lg">
                  #{index + 1}
                </div>

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-neutral-200 rounded-xl">
          <ImageIcon className="mx-auto mb-3 text-neutral-400" size={40} />
          <p className="text-sm font-medium text-neutral-700 mb-1">
            Nicio imagine încărcată
          </p>
          <p className="text-xs text-neutral-500">
            Prima imagine va fi imaginea principală a produsului
          </p>
        </div>
      )}
    </div>
  );
}
