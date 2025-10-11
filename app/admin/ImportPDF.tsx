'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Package } from 'lucide-react';

interface ImportResult {
  success: boolean;
  imported: number;
  total_extracted: number;
  file_name: string;
  brand: string;
  catalog_type: string;
  storage_url: string | null;
  products: any[];
  ai_model: string;
  tokens_used: number;
  error?: string;
}

export default function ImportPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [brandName, setBrandName] = useState('');
  const [catalogType, setCatalogType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Vă rugăm selectați un fișier PDF');
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
        toast.error('Fișierul este prea mare. Maxim 20MB permis.');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selectați un fișier PDF');
      return;
    }

    if (!brandName.trim()) {
      toast.error('Introduceți numele brand-ului/producătorului');
      return;
    }

    setUploading(true);
    setProgress('📤 Se încarcă PDF-ul...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('brandName', brandName);
    formData.append('catalogType', catalogType);

    try {
      setProgress('🤖 GPT-4o analizează catalogul...');
      
      const response = await fetch('/api/admin/products/import-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import eșuat');
      }

      setProgress('✅ Import complet!');
      setResult(data);
      toast.success(`Import reușit! ${data.imported} produse adăugate din ${data.total_extracted} extrase`);
      
      // Reset form
      setFile(null);
      setBrandName('');
      setCatalogType('general');
      
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Eroare la import PDF');
      setResult({ 
        error: error.message,
        success: false,
        imported: 0,
        total_extracted: 0,
        file_name: file.name,
        brand: brandName,
        catalog_type: catalogType,
        storage_url: null,
        products: [],
        ai_model: 'gpt-4o',
        tokens_used: 0
      });
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="import-pdf">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-purple-600 rounded-xl">
            <Sparkles className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Import PDF cu AI (GPT-4o Vision)
            </h3>
            <p className="text-sm text-neutral-700">
              Încarcă cataloage PDF complete. GPT-4o va extrage automat produse, prețuri, dimensiuni și specificații tehnice.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Brand / Producător *
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ex: PIANCA, LAGO, etc."
              className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-purple-500 focus:outline-none"
              disabled={uploading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Tip Catalog
            </label>
            <select
              value={catalogType}
              onChange={(e) => setCatalogType(e.target.value)}
              className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-purple-500 focus:outline-none"
              disabled={uploading}
            >
              <option value="general">General</option>
              <option value="living">Living / Sufragerie</option>
              <option value="bedroom">Dormitor</option>
              <option value="kitchen">Bucătărie</option>
              <option value="office">Birou</option>
              <option value="outdoor">Exterior</option>
              <option value="accessories">Accesorii</option>
            </select>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-purple-300 bg-white rounded-xl p-8 text-center hover:border-purple-500 transition">
          <Upload className="mx-auto mb-4 text-purple-400" size={48} />
          
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          
          <label
            htmlFor="pdf-upload"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-lg cursor-pointer hover:bg-purple-700 transition disabled:opacity-50"
          >
            Selectează PDF
          </label>
          
          {file && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <FileText size={16} className="text-purple-600" />
              <span className="font-medium text-neutral-900">{file.name}</span>
              <span className="text-neutral-500">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
          
          <p className="text-xs text-neutral-500 mt-2">
            Format acceptat: PDF • Maxim 20MB
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || !brandName.trim() || uploading}
          className="w-full mt-4 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Procesare în curs...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Analizează cu AI
            </>
          )}
        </button>

        {/* Progress Indicator */}
        {uploading && progress && (
          <div className="mt-4 p-4 bg-purple-100 border border-purple-300 rounded-lg">
            <p className="text-sm font-medium text-purple-900">{progress}</p>
            <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 animate-pulse w-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-2xl border-2 p-6 ${
          result.success 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start gap-4 mb-4">
            {result.success ? (
              <CheckCircle className="text-green-600" size={32} />
            ) : (
              <AlertCircle className="text-red-600" size={32} />
            )}
            
            <div className="flex-1">
              <h4 className="text-lg font-bold text-neutral-900 mb-2">
                {result.success ? 'Import Reușit!' : 'Import Eșuat'}
              </h4>
              
              {result.success ? (
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-700">
                    <span className="font-bold">{result.imported}</span> produse importate din{' '}
                    <span className="font-bold">{result.total_extracted}</span> extrase
                  </p>
                  <p className="text-neutral-600">
                    📦 Brand: <span className="font-medium">{result.brand}</span>
                  </p>
                  <p className="text-neutral-600">
                    📁 Fișier: <span className="font-medium">{result.file_name}</span>
                  </p>
                  <p className="text-neutral-600">
                    🤖 Model AI: <span className="font-medium">{result.ai_model}</span>
                  </p>
                  <p className="text-neutral-600">
                    🎯 Tokens folosiți: <span className="font-medium">{result.tokens_used.toLocaleString()}</span>
                  </p>
                </div>
              ) : (
                <p className="text-red-700">{result.error}</p>
              )}
            </div>
          </div>

          {/* Preview Products */}
          {result.success && result.products && result.products.length > 0 && (
            <div className="mt-4 border-t-2 border-green-300 pt-4">
              <h5 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <Package size={18} />
                Preview Produse Importate (primele {Math.min(result.products.length, 10)})
              </h5>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.products.slice(0, 10).map((product: any, index: number) => (
                  <div 
                    key={index}
                    className="p-3 bg-white border border-green-200 rounded-lg text-sm"
                  >
                    <div className="font-bold text-neutral-900">{product.name}</div>
                    <div className="text-neutral-600 text-xs mt-1">
                      SKU: {product.sku} • {product.price_public_ttc ? `${product.price_public_ttc} RON` : 'Preț nedefinit'}
                      {product.width && product.length && product.height && (
                        <> • {product.width}×{product.length}×{product.height} cm</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border-2 border-neutral-200 rounded-xl">
          <h5 className="font-bold text-neutral-900 mb-2 text-sm">📄 Format Suportat</h5>
          <p className="text-xs text-neutral-600">
            PDF cataloage de produse cu text și imagini
          </p>
        </div>
        
        <div className="p-4 bg-white border-2 border-neutral-200 rounded-xl">
          <h5 className="font-bold text-neutral-900 mb-2 text-sm">🤖 Tehnologie AI</h5>
          <p className="text-xs text-neutral-600">
            GPT-4o Vision - cel mai avansat model de analiză vizuală
          </p>
        </div>
        
        <div className="p-4 bg-white border-2 border-neutral-200 rounded-xl">
          <h5 className="font-bold text-neutral-900 mb-2 text-sm">⚡ Extracție Automată</h5>
          <p className="text-xs text-neutral-600">
            Cod produs, nume, preț, dimensiuni, material, finisaj
          </p>
        </div>
      </div>
    </div>
  );
}
