'use client';

import { useState } from 'react';

export default function FixHero() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);

  const fixUrl = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/fix-hero-url', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setResult(data);
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">🔧 Fix Hero Image URL</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Problem Identified</h2>
          <p className="text-gray-700 mb-4">
            The hero image URL in the database uses a placeholder domain instead of the real R2 domain.
          </p>
          <div className="space-y-2 text-sm">
            <div><strong>Wrong:</strong> <code className="bg-red-50 px-2 py-1 rounded">pub-your-r2-domain.cloudflare.com</code></div>
            <div><strong>Correct:</strong> <code className="bg-green-50 px-2 py-1 rounded">pub-52df54499f9f4836a88ab79b2ff9f8cb.r2.dev</code></div>
          </div>
        </div>

        <div className="p-6 bg-white border-2 border-blue-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Fix URL</h2>
          <button
            onClick={fixUrl}
            disabled={status === 'loading'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'loading' ? 'Fixing...' : 'Fix Hero Image URL'}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border-2 ${
            status === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : status === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <h3 className="font-semibold mb-2">
              {status === 'error' ? '❌ Error' : status === 'success' ? '✅ Success' : 'ℹ️ Info'}
            </h3>
            <p>{message}</p>
          </div>
        )}

        {result && (
          <div className="p-6 bg-white border-2 border-green-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Result</h3>
            <div className="space-y-2 text-sm">
              {result.oldUrl && (
                <div>
                  <strong>Old URL:</strong>
                  <div className="break-all bg-red-50 p-2 rounded mt-1">{result.oldUrl}</div>
                </div>
              )}
              {result.newUrl && (
                <div>
                  <strong>New URL:</strong>
                  <div className="break-all bg-green-50 p-2 rounded mt-1">{result.newUrl}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Test Homepage
          </a>
          <a href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Back to Admin
          </a>
        </div>
      </div>
    </div>
  );
}