export const revalidate = 3600;

export async function GET() {
  const base = process.env.NEXT_PUBLIC_URL || 'https://otka.ro';
  
  let urls = '';
  
  // Only try to connect to Supabase if variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data } = await supabase.from('products_public').select('slug').limit(5000);
      urls = (data as { slug: string }[] | null)?.map((p) => 
        `<url><loc>${base}/p/${p.slug}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`
      ).join('') || '';
    } catch (error) {
      console.warn('Failed to fetch products for sitemap:', error);
      // Return basic sitemap without products if database connection fails
    }
  } else {
    console.warn('Supabase variables not available, generating basic sitemap');
  }
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/parteneri</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${base}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${urls}
</urlset>`;
  
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
