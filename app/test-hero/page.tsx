import { getServerSupabase } from "../auth/server";

export default async function TestHero() {
  const supabase = await getServerSupabase();
  
  // Test direct query
  const { data: assets, error } = await supabase
    .from('public_assets')
    .select('*')
    .eq('active', true)
    .eq('type', 'og')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  // Test API call
  let apiResult = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || ''}/api/public/og?t=${Date.now()}`, { cache: 'no-store' });
    apiResult = await res.json();
  } catch (e: any) {
    apiResult = { error: e.message };
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">🖼️ Test Hero Image</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Database Query Direct</h2>
          {error ? (
            <div className="p-3 bg-red-50 text-red-800 rounded">
              Error: {error.message}
            </div>
          ) : (
            <div className="space-y-3">
              <div>Found {assets?.length || 0} active OG assets</div>
              {assets?.map((asset, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded">
                  <div><strong>Title:</strong> {asset.title}</div>
                  <div><strong>URL:</strong> {asset.url}</div>
                  <div><strong>Active:</strong> {asset.active ? 'Yes' : 'No'}</div>
                  <div><strong>Type:</strong> {asset.type}</div>
                  <div><strong>Sort Order:</strong> {asset.sort_order}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-2 border-blue-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">API Result</h2>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </div>

        <div className="p-6 bg-white border-2 border-green-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Image Test</h2>
          {apiResult?.url && (
            <div className="space-y-4">
              <div>
                <strong>Trying to load:</strong> {apiResult.url}
              </div>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded">
                <img 
                  src={`${apiResult.url}?v=${Date.now()}`}
                  alt="Test hero image" 
                  className="max-w-full h-auto rounded"
                  onLoad={() => console.log('✅ Image loaded successfully')}
                  onError={(e) => {
                    console.error('❌ Image failed to load');
                    (e.target as HTMLImageElement).style.background = '#f3f4f6';
                    (e.target as HTMLImageElement).style.display = 'block';
                    (e.target as HTMLImageElement).style.width = '300px';
                    (e.target as HTMLImageElement).style.height = '200px';
                    (e.target as HTMLImageElement).alt = 'Failed to load image';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Homepage
          </a>
          <a href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Back to Admin
          </a>
        </div>
      </div>
    </div>
  );
}