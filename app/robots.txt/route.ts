export async function GET() {
  const base = process.env.NEXT_PUBLIC_URL || 'https://otka.ro';
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
