import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { parse } from 'csv-parse/sync';

export async function POST(request: Request) {
  // Using supabaseAdmin (service_role key - bypasses RLS)
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const text = await file.text();
  const records = parse(text, { columns: true, skip_empty_lines: true });

  const products = [];
  for (const row of records) {
    const slug = (row.name || '').toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    products.push({
      name: row.name || '',
      sku: row.sku || '',
      slug: slug || `product-${Date.now()}`,
      description: row.description || '',
      price_public_ttc: parseFloat(row.price_public_ttc || '0'),
      price_partner_net: parseFloat(row.price_partner_net || '0'),
      stock_qty: parseInt(row.stock_qty || '0'),
      gallery: row.gallery ? JSON.parse(row.gallery) : [],
      visible: row.visible === 'true' || row.visible === '1',
    });
  }

  const { error } = await supabase.from('products').insert(products);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ imported: products.length });
}
