'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PartnerResource {
  id: string;
  name: string;
  description: string;
  file_type: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export default function PartnerResources() {
  const [resources, setResources] = useState<PartnerResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partners/resources');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResources(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Eroare la încărcare';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeLabel = (type: string) => {
    switch(type) {
      case 'price_list': return 'Listă Prețuri';
      case 'catalog': return 'Catalog';
      case 'images': return 'Imagini';
      case 'materials': return 'Materiale';
      default: return 'Document';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('zip')) return '📦';
    if (mimeType?.includes('image')) return '🖼️';
    return '📁';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="h-4 w-1/3 bg-neutral-100 rounded mb-2"></div>
            <div className="h-3 w-2/3 bg-neutral-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="p-6 border-b border-neutral-200">
        <h3 className="font-semibold text-lg text-neutral-900">Resurse și Documente</h3>
        <p className="text-sm text-neutral-600 mt-1">Liste prețuri, cataloage și materiale pentru parteneri</p>
      </div>
      
      <div className="p-6">
        {resources.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <div className="text-4xl mb-4">📚</div>
            <p>Nu sunt resurse disponibile momentan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <div key={resource.id} className="border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(resource.mime_type || '')}</span>
                    <div>
                      <h4 className="font-medium text-neutral-900">{resource.name}</h4>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {getFileTypeLabel(resource.file_type)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {resource.description && (
                  <p className="text-sm text-neutral-600 mb-3">{resource.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-neutral-500">
                    {formatFileSize(resource.file_size)}
                    {resource.created_at && (
                      <span className="ml-2">
                        {new Date(resource.created_at).toLocaleDateString('ro-RO')}
                      </span>
                    )}
                  </div>
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full text-sm hover:bg-neutral-800 transition"
                  >
                    <span>Descarcă</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}