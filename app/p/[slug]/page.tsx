import { supabase } from "../../../lib/supabaseClient";
import type { Database } from "../../../types/supabase";
import type { Metadata } from 'next';
import Link from "next/link";
import AddToCartClient from './AddToCartClient';
import ProductGallery from './ProductGallery';
import ShareButtons from '@/components/ShareButtons';

export const revalidate = 60; // ISR

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

type PageProps = { params: Promise<{ slug: string }> };

// Generate metadata for SEO + Social Sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) {
    return {
      title: 'Produs negăsit | OTKA',
    };
  }

  const p = data as ProductRow;
  const galleryArr = Array.isArray(p.gallery) ? (p.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  const img = galleryArr?.[0] || '/images/product-placeholder.jpg';
  const productUrl = `https://otka.ro/p/${p.slug}`;
  const description = p.description || `${p.name} - Disponibil la OTKA. Preț: ${new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}`;

  return {
    title: `${p.name} | OTKA`,
    description: description.substring(0, 160),
    openGraph: {
      title: p.name,
      description: description.substring(0, 160),
      url: productUrl,
      siteName: 'OTKA',
      images: [
        {
          url: img,
          width: 1200,
          height: 630,
          alt: p.name,
        },
      ],
      locale: 'ro_RO',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: p.name,
      description: description.substring(0, 160),
      images: [img],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-semibold text-neutral-900">Produsul nu a fost găsit</h1>
        <p className="mt-2 text-neutral-600">S-ar putea să fi fost scos din stoc sau ascuns.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-black text-white px-5 py-2.5 text-sm">Înapoi la produse</Link>
      </div>
    );
  }

  const p = data as ProductRow;
  const galleryArr = Array.isArray(p.gallery) ? (p.gallery as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  const img = galleryArr?.[0] || "/vercel.svg";
  const productUrl = `https://otka.ro/p/${p.slug}`;
  
  // Schema.org Product markup for Google & search engines
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description || `${p.name} disponibil la OTKA`,
    image: galleryArr,
    sku: p.sku,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'RON',
      price: p.price_public_ttc || 0,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: p.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      availability: p.stock_qty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'OTKA'
      }
    }
  };

  return (
    <>
      {/* Schema.org Product JSON-LD for SEO & Google AI Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProductGallery images={galleryArr} productName={p.name} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{p.name}</h1>
            
            {/* Description */}
            {p.description && (
              <p className="mt-4 text-neutral-700 leading-relaxed">
                {p.description}
              </p>
            )}

            <div className="mt-4 text-neutral-600 text-sm">TVA inclus</div>
            <div className="flex items-center gap-3 mt-2">
              {p.price_original && p.price_original > p.price_public_ttc && (
                <div className="text-lg text-neutral-500 line-through">
                  {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_original)}
                </div>
              )}
              <div className="text-2xl font-semibold text-neutral-900">
                {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(p.price_public_ttc || 0)}
              </div>
              {p.price_original && p.price_original > p.price_public_ttc && (
                <div className="text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                  -{Math.round(((p.price_original - p.price_public_ttc) / p.price_original) * 100)}%
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3 text-neutral-700">
              <div><span className="text-neutral-500">SKU:</span> {p.sku}</div>
              <div><span className="text-neutral-500">Stoc:</span> {p.stock_qty > 0 ? `${p.stock_qty} bucăți` : 'Stoc epuizat'}</div>
              {p.location && <div><span className="text-neutral-500">Locație:</span> {p.location}</div>}
            </div>

            <div className="mt-6">
              <AddToCartClient item={{ id: p.id as number, sku: p.sku, name: p.name, price: p.price_public_ttc || 0, image: img }} />
            </div>

            {/* Share Buttons */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <ShareButtons 
                url={productUrl}
                title={p.name}
                description={p.description || undefined}
                compact={false}
              />
            </div>

            <div className="mt-6">
              <Link href="/" className="inline-flex rounded-full bg-black text-white px-5 py-2.5 text-sm hover:bg-neutral-800 transition">Înapoi la produse</Link>
            </div>
          </div>
        </div>

        {/* Additional product details for SEO */}
        {p.description && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Detalii Produs</h2>
            <div className="prose prose-neutral max-w-none text-neutral-700">
              <p>{p.description}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
