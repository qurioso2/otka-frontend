'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function ImportCatalog() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selectați un fișier');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/products/import-catalog', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import eșuat');
      }

      setResult(data);
      toast.success(`Import reușit! ${data.imported} produse adăugate/actualizate`);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Eroare la import');
      setResult({ error: error.message });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const template = `SKU,Nume,Descriere,Categorie,Finisaj,Culoare,Material,Latime,Lungime,Inaltime,Greutate,Pret,Pret Partner,Pret Original,Stoc,Imagini
OTKA-001,Canapea Moderna 3 Locuri,Canapea extensibila cu spatar reglabil,Living,Catifea Gri,Gri,Catifea + Metal,200,90,85,45,2999.99,2499.99,3499.99,5,https://example.com/img1.jpg
OTKA-002,Fotoliu Scandinav,Fotoliu confortabil stil nordic,Living,Lemn Stejar,Bej,Lemn + Textil,70,75,90,12,899.99,749.99,1099.99,10,https://example.com/img2.jpg
OTKA-003,Masa Dining Extensibila,Masa dining cu blat extensibil,Dining,Stejar Natural,Maro,Lemn Masiv,180,90,75,35,1899.99,1599.99,,3,https://example.com/img3.jpg`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-import-produse-otka.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Template descărcat!');
  };

  return (
    <div className="space-y-6" data-testid="import-catalog">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-neutral-300 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Import Listă Prețuri / Catalog
            </h3>
            <p className="text-sm text-neutral-600">
              Încarcă produse în masă din fișiere CSV sau Excel (.xlsx, .xls)
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 border-2 border-neutral-300 rounded-lg text-sm font-bold hover:bg-neutral-50"
          >
            <Download size={16} />
            Descarcă Template CSV
          </button>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-blue-500 transition">
          <Upload className="mx-auto mb-4 text-neutral-400" size={48} />
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block"
          >
            <span className="text-blue-600 hover:underline font-semibold">
              Alege fișier
            </span>
            <span className="text-neutral-600"> sau trage aici</span>
          </label>
          
          <p className="text-sm text-neutral-500 mt-2">
            Formate acceptate: CSV, Excel (.xlsx, .xls)
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Maxim 10MB pe fișier
          </p>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold text-neutral-900">{file.name}</p>
                <p className="text-sm text-neutral-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFile(null)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:bg-white"
              >
                Anulează
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 font-bold"
              >
                {uploading ? 'Se încarcă...' : 'Import'}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !result.error && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-green-800">Import reușit!</p>
              <p className="text-sm text-green-700 mt-1">
                <strong>{result.imported}</strong> produse importate din{' '}
                <strong>{result.total_parsed}</strong> găsite în fișier
              </p>
              <p className="text-xs text-green-600 mt-1">
                Fișier: {result.file_name}
              </p>
            </div>
          </div>
        )}

        {result?.error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Eroare la import</p>
              <p className="text-sm text-red-700 mt-1">{result.error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Format Documentation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-blue-900 mb-4">
          📋 Format Fișier Necesar
        </h4>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-blue-800 mb-2 font-semibold">
              Coloane obligatorii (în orice ordine):
            </p>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <ul className="text-sm space-y-1 text-neutral-900">
                <li>• <strong>SKU</strong> - Cod unic produs (ex: OTKA-001)</li>
                <li>• <strong>Nume</strong> - Numele produsului</li>
                <li>• <strong>Pret</strong> - Preț public cu TVA</li>
              </ul>
            </div>
          </div>

          <div>
            <p className="text-sm text-blue-800 mb-2 font-semibold">
              Coloane opționale:
            </p>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-neutral-700">
                <div>• Descriere</div>
                <div>• Pret Partner</div>
                <div>• Categorie</div>
                <div>• Pret Original</div>
                <div>• Finisaj</div>
                <div>• Stoc</div>
                <div>• Culoare</div>
                <div>• Imagini (URL-uri)</div>
                <div>• Material</div>
                <div>• Latime/Lungime/Inaltime</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-100 rounded-lg p-3 text-xs text-neutral-600">
            <p className="font-semibold mb-1">💡 Sfat:</p>
            <p>
              Fișierul acceptă diverse variante de denumiri pentru coloane (română/engleză).
              Ex: "Pret" = "Price", "Latime" = "Width", etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
