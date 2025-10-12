import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';

export async function POST(request: NextRequest) {
    const supabase = await getServerSupabase();
  try {
    const supabase = await getServerSupabase();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read CSV content
    const csvContent = await file.text();
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have header and at least one row' }, { status: 400 });
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['sku', 'name', 'price_public_ttc', 'price_partner_net', 'stock_qty', 'gallery', 'description'];
    
    // Validate headers
    const missingHeaders = expectedHeaders.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}`,
        received: header,
        expected: expectedHeaders
      }, { status: 400 });
    }

    // Parse products
    const products = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const product: any = {};
      
      header.forEach((h, index) => {
        const value = values[index] || '';
        if (h === 'price_public_ttc' || h === 'price_partner_net') {
          product[h] = parseFloat(value) || 0;
        } else if (h === 'stock_qty') {
          product[h] = parseInt(value) || 0;
        } else if (h === 'gallery') {
          product[h] = value ? value.split('|').map(url => url.trim()).filter(Boolean) : [];
        } else {
          product[h] = value;
        }
      });
      
      // Generate slug from name
      if (product.name) {
        product.slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      
      products.push(product);
    }

    console.log('Parsed products:', products.length);

    // Insert products
    const { data, error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'sku' })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
