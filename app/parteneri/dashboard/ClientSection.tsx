'use client';

import { useState } from 'react';

export default function ClientSection({ initialCatalogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log('Upload result:', result);
  };

  const filteredCatalogs = initialCatalogs?.filter(catalog =>
    catalog.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 bg-gray-800 rounded shadow text-gray-200">
      <h2 className="text-xl font-semibold mb-2">Cataloage</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search catalogs..."
        className="border p-2 m-2 text-black"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 m-2"
      />
      <button onClick={handleUpload} className="bg-blue-500 text-white p-2 m-2">
        Upload
      </button>
      <p>{JSON.stringify(filteredCatalogs)}</p>
    </div>
  );
}