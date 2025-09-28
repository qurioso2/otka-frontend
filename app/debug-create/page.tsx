'use client';

import { useState } from 'react';

export default function DebugCreate() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-create', { method: 'POST' });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCreateProduct = async () => {
    setLoading(true);
    try {
      const testProduct = {
        sku: 'TEST' + Date.now(),
        name: 'Produs Test ' + Date.now(),
        price_public_ttc: '150.00',
        price_partner_net: '120.00',
        stock_qty: '5',
        description: 'Produs de test pentru debugging',
        gallery: []
      };

      const response = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProduct)
      });
      
      const data = await response.json();
      setResult({ createResponse: data, status: response.status });
    } catch (error: any) {
      setResult({ createError: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Create Product</h1>
      
      <div className="space-y-6">
        <div className="flex gap-4">
          <button
            onClick={testDebug}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth & Environment'}
          </button>
          
          <button
            onClick={testCreateProduct}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Test Create Product'}
          </button>
        </div>

        {result && (
          <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Result:</h3>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-4">
          <a href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Back to Admin
          </a>
        </div>
      </div>
    </div>
  );
}