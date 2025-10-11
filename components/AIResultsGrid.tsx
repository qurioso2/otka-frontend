'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Info, Sparkles, Ruler, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price_public_ttc: number;
  price_partner_net: number;
  stock_qty: number;
  gallery?: string[];
  finish?: string;
  color?: string;
  material?: string;
  width?: number;
  length?: number;
  height?: number;
  similarity_score: number;
  final_score?: number;
  similar_finishes?: any[];
  similar_sizes?: any[];
}

interface AIResultsGridProps {
  results: SearchResult[];
  onAddToQuote?: (product: SearchResult) => void;
}

export default function AIResultsGrid({ results, onAddToQuote }: AIResultsGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<SearchResult | null>(null);

  const handleAddToQuote = (product: SearchResult) => {
    if (onAddToQuote) {
      onAddToQuote(product);
    } else {
      // Temporary: just show toast until quote system is implemented
      toast.success(`${product.name} adăugat în draft ofertă`);
      console.log('Add to quote:', product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getMatchQuality = (score: number) => {
    if (score >= 0.85) return { label: 'Potrivire Excelentă', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (score >= 0.75) return { label: 'Potrivire Bună', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (score >= 0.65) return { label: 'Potrivire Medie', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'Potrivire Slabă', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' };
  };

  return (
    <div className="space-y-4" data-testid="ai-results-grid">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <Sparkles className="text-violet-600" size={24} />
          Rezultate căutare ({results.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => {
          const matchQuality = getMatchQuality(product.final_score || product.similarity_score);
          const mainImage = product.gallery?.[0] || '/placeholder-product.jpg';

          return (
            <div
              key={product.id}
              className="bg-white border-2 border-neutral-200 rounded-xl overflow-hidden hover:border-violet-300 hover:shadow-lg transition group"
              data-testid={`product-card-${product.sku}`}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-neutral-100">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.jpg';
                  }}
                />
                
                {/* Match Quality Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold border-2 ${matchQuality.color}`}>
                  {matchQuality.label}
                </div>

                {/* Stock Badge */}
                {product.stock_qty > 0 ? (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                    În Stoc: {product.stock_qty}
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-bold">
                    Stoc Epuizat
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs font-medium text-neutral-500 uppercase">
                    {product.sku}
                  </span>
                  {product.category && (
                    <span className="ml-2 text-xs text-neutral-500">
                      • {product.category}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-neutral-900 mb-2 line-clamp-2 min-h-[3rem]">
                  {product.name}
                </h4>

                {product.description && (
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Specs */}
                <div className="space-y-2 mb-4">
                  {(product.finish || product.color || product.material) && (
                    <div className="flex items-center gap-2 text-xs">
                      <Palette size={14} className="text-violet-600" />
                      <span className="text-neutral-700">
                        {[product.finish, product.color, product.material].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                  )}

                  {(product.width && product.length && product.height) && (
                    <div className="flex items-center gap-2 text-xs">
                      <Ruler size={14} className="text-violet-600" />
                      <span className="text-neutral-700">
                        {product.width} × {product.length} × {product.height} cm
                      </span>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="border-t-2 border-neutral-200 pt-3 mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-600">Preț Public:</span>
                    <span className="text-lg font-bold text-neutral-900">
                      {formatPrice(product.price_public_ttc)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-emerald-700">Preț Partener:</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatPrice(product.price_partner_net)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToQuote(product)}
                    className="flex-1 px-4 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition flex items-center justify-center gap-2"
                    data-testid={`add-to-quote-${product.sku}`}
                  >
                    <ShoppingCart size={16} />
                    Adaugă în Ofertă
                  </button>
                  
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="px-3 py-2 border-2 border-neutral-300 rounded-lg hover:border-violet-300 transition"
                    title="Detalii"
                  >
                    <Info size={16} />
                  </button>
                </div>

                {/* Similar Products Info */}
                {(product.similar_finishes?.length || product.similar_sizes?.length) ? (
                  <div className="mt-3 text-xs text-neutral-600 border-t border-neutral-200 pt-2">
                    {product.similar_finishes?.length > 0 && (
                      <span className="block">
                        ✓ {product.similar_finishes.length} finisaje similare disponibile
                      </span>
                    )}
                    {product.similar_sizes?.length > 0 && (
                      <span className="block">
                        ✓ {product.similar_sizes.length} dimensiuni similare disponibile
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Details Modal - Simple version for now */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-neutral-900">{selectedProduct.name}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedProduct.gallery && selectedProduct.gallery.length > 0 && (
                <img
                  src={selectedProduct.gallery[0]}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.jpg';
                  }}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-bold text-neutral-700">SKU:</span>
                  <p className="text-neutral-900">{selectedProduct.sku}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-700">Categorie:</span>
                  <p className="text-neutral-900">{selectedProduct.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-700">Stoc:</span>
                  <p className="text-neutral-900">{selectedProduct.stock_qty} buc</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-700">Material:</span>
                  <p className="text-neutral-900">{selectedProduct.material || 'N/A'}</p>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <span className="text-sm font-bold text-neutral-700">Descriere:</span>
                  <p className="text-neutral-700 mt-1">{selectedProduct.description}</p>
                </div>
              )}

              <button
                onClick={() => {
                  handleAddToQuote(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full px-6 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition"
              >
                Adaugă în Ofertă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}