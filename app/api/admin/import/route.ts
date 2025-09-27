import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../auth/server';
import { parse } from 'csv-parse/sync';
import type { Database } from '../../../../types/supabase';

type Row = {
  sku: string;
  name: string;
  slug: string;
  price_public_ttc: string;
  price_partner_net?: string;
  stock_qty?: string;
  gallery?: string; // ; separated
  visible?: string; // true/false
};

type InsertProduct = Database['public']['Tables']['products']['Insert'];

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  let records: Row[] = [];
  try {
    records = parse(buf.toString('utf8'), { columns: true, skip_empty_lines: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'CSV parse error', detail: e.message }, { status: 400 });
  }

  const upserts: InsertProduct[] = records.map((r) => ({
    sku: r.sku?.trim(),
    name: r.name?.trim(),
    slug: r.slug?.trim(),
    price_public_ttc: Number(r.price_public_ttc || 0),
    price_partner_net: r.price_partner_net ? Number(r.price_partner_net) : null,
    stock_qty: r.stock_qty ? Number(r.stock_qty) : 0,
    gallery: r.gallery ? r.gallery.split(';').map(s => s.trim()).filter(Boolean) : null,
    visible: r.visible ? r.visible.toLowerCase() === 'true' : true,
  }));

  const { data, error } = await supabase.from('products').upsert(upserts, { onConflict: 'sku' }).select('sku');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, count: data?.length || 0 });
}
