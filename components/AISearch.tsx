'use client';

import { useState } from 'react';
import { Search, Image as ImageIcon, Sparkles, Loader2, X, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import AIResultsGrid from './AIResultsGrid';

interface SearchFilters {
  priceRange?: [number, number];
  category?: string;
  inStock?: boolean;
  threshold?: number;
  limit?: number;
}

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
}

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'text' | 'image' | 'both'>('text');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 100000],
    category: '',
    inStock: false,
    threshold: 0.65,
    limit: 20,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vă rugăm selectați o imagine validă');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imaginea este prea mare. Maxim 5MB permis.');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleImageSelect(fakeEvent);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageAnalysis(null);
  };

  const handleSearch = async () => {
    if (!query.trim() && !image) {
      toast.error('Introduceți text sau încărcați o imagine pentru căutare');
      return;
    }

    setSearching(true);
    setResults([]);
    setImageAnalysis(null);

    try {
      let response;

      if (image) {
        // Image search
        const formData = new FormData();
        formData.append('image', image);
        formData.append('filters', JSON.stringify(filters));

        response = await fetch('/api/search/ai-image', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Text search
        response = await fetch('/api/search/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, filters }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Căutare eșuată');
      }

      setResults(data.results || []);
      if (data.image_analysis) {
        setImageAnalysis(data.image_analysis);
      }

      if (data.results?.length === 0) {
        toast.info('Nu s-au găsit rezultate. Încercați alți termeni sau ajustați filtrele.');
      } else {
        toast.success(`${data.results?.length} produse găsite`);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.message || 'Eroare la căutare');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6" data-testid="ai-search">
      {/* Search Header */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border-2 border-violet-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-violet-600 rounded-xl">
            <Sparkles className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Căutare Inteligentă Produse
            </h2>
            <p className="text-sm text-neutral-700">
              Căutați produse folosind limbaj natural sau încărcați o poză cu produsul dorit.
              AI-ul va găsi cele mai potrivite rezultate.
            </p>
          </div>
        </div>

        {/* Search Modes */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSearchType('text')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              searchType === 'text'
                ? 'bg-violet-600 text-white'
                : 'bg-white text-neutral-700 border-2 border-neutral-300 hover:border-violet-300'
            }`}
          >
            <Search className="inline-block mr-2" size={16} />
            Text
          </button>
          <button
            onClick={() => setSearchType('image')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              searchType === 'image'
                ? 'bg-violet-600 text-white'
                : 'bg-white text-neutral-700 border-2 border-neutral-300 hover:border-violet-300'
            }`}
          >
            <ImageIcon className="inline-block mr-2" size={16} />
            Imagine
          </button>
        </div>

        {/* Text Search Input */}
        {(searchType === 'text' || searchType === 'both') && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ex: canapea moderna 3 locuri culoare gri, finisaj catifea..."
                className="w-full px-4 py-3 pr-12 border-2 border-neutral-300 rounded-lg focus:border-violet-500 focus:outline-none text-neutral-900 placeholder:text-neutral-500"
                disabled={searching}
              />
              <Search className="absolute right-4 top-3.5 text-neutral-400" size={20} />
            </div>
          </div>
        )}

        {/* Image Upload */}
        {(searchType === 'image' || searchType === 'both') && (
          <div className="mb-4">
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-violet-300 bg-white rounded-xl p-6 text-center hover:border-violet-500 transition cursor-pointer"
              >
                <input
                  type="file"
                  id="image-search-upload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={searching}
                />
                <label htmlFor="image-search-upload" className="cursor-pointer">
                  <ImageIcon className="mx-auto mb-3 text-violet-400" size={40} />
                  <p className="font-medium text-neutral-900 mb-1">
                    Încarcă o imagine cu produsul dorit
                  </p>
                  <p className="text-sm text-neutral-600">
                    Drag & drop sau click pentru a selecta • JPG, PNG, WebP • Max 5MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative border-2 border-violet-300 bg-white rounded-xl p-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  disabled={searching}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-neutral-300 bg-white rounded-lg hover:border-violet-300 transition font-medium text-sm"
          >
            <SlidersHorizontal size={16} />
            Filtre {showFilters ? '▲' : '▼'}
          </button>
          
          <div className="text-xs text-neutral-600">
            {results.length > 0 && `${results.length} rezultate găsite`}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border-2 border-neutral-200 rounded-xl mb-4">
            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Preț (RON)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceRange?.[0]}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: [parseInt(e.target.value) || 0, filters.priceRange?.[1] || 100000]
                  })}
                  className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={filters.priceRange?.[1]}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: [filters.priceRange?.[0] || 0, parseInt(e.target.value) || 100000]
                  })}
                  className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg text-sm"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Categorie
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg text-sm"
              >
                <option value="">Toate categoriile</option>
                <option value="living">Living</option>
                <option value="bedroom">Dormitor</option>
                <option value="dining">Dining</option>
                <option value="office">Birou</option>
                <option value="outdoor">Exterior</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-900 mb-2">
                Disponibilitate
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300"
                />
                <span className="text-sm text-neutral-700">Doar produse în stoc</span>
              </label>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={(!query.trim() && !image) || searching}
          className="w-full px-6 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {searching ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Căutare în curs...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Caută cu AI
            </>
          )}
        </button>
      </div>

      {/* Image Analysis Chips */}
      {imageAnalysis?.descriptors && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <h3 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
            <ImageIcon size={18} />
            Caracteristici detectate din imagine
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(imageAnalysis.descriptors).map(([key, value]: [string, any]) => {
              if (!value || typeof value === 'object') return null;
              return (
                <span
                  key={key}
                  className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-full text-sm font-medium text-blue-900"
                >
                  {key}: {value}
                </span>
              );
            })}
          </div>
          <p className="text-xs text-neutral-600 mt-2">
            Query generat: <span className="font-medium">{imageAnalysis.generated_query}</span>
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <AIResultsGrid results={results} />
      )}

      {/* Empty State */}
      {!searching && results.length === 0 && !imageAnalysis && (
        <div className="text-center py-12">
          <Sparkles className="mx-auto mb-4 text-neutral-400" size={48} />
          <h3 className="text-lg font-bold text-neutral-900 mb-2">
            Începe cu o căutare
          </h3>
          <p className="text-neutral-600">
            Descrie produsul dorit sau încarcă o imagine pentru rezultate personalizate
          </p>
        </div>
      )}
    </div>
  );
}