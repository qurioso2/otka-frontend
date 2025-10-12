import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Read CSV content
    const csvContent = await file.text();
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one row' }, { status: 400 });

    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['sku', 'name', 'price_public_ttc', 'price_partner_net', 'stock_qty', 'gallery', 'description'];
    
    // Validate headers
    const missingHeaders = expectedHeaders.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}` 
      }, { status: 400 });

    // Parse rows
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== header.length) continue;

      const product: any = {};
      header.forEach((h, index) => {
        product[h] = values[index];
      });

      // Process product data
      products.push({
        sku: product.sku,
        name: product.name,
        slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price_public_ttc: parseFloat(product.price_public_ttc) || 0,
        price_partner_net: parseFloat(product.price_partner_net) || 0,
        stock_qty: parseInt(product.stock_qty) || 0,
        description: product.description || '',
        gallery: product.gallery ? [product.gallery] : []
      });

    if (products.length === 0) {
      return NextResponse.json({ error: 'No valid products found in CSV' }, { status: 400 });

    // Insert products
    const { data, error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'sku' })
      .select();

    if (error) {
      console.error('Error importing products:', error);
      return NextResponse.json({ error: 'Failed to import products' }, { status: 500 });

    return NextResponse.json({ 
      message: 'Products imported successfully',
      imported: data?.length || 0,
      products: data
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
