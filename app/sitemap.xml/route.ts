import { supabase } from "../../lib/supabaseClient";

export const revalidate = 3600;

export async function GET() {
  const base = process.env.NEXT_PUBLIC_URL || 'https://otka.ro';
  const { data } = await supabase.from('products_public').select('slug').limit(5000);
  const urls = (data as { slug: string }[] | null)?.map((p) => `<url><loc>${base}/p/${p.slug}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`).join('') || '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>${urls}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
