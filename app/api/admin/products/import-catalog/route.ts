import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    // Using supabaseAdmin (service_role key - bypasses RLS)
    
    // Verify admin access
    }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    let products: any[] = [];

    console.log(`Processing file: ${file.name}, type: ${fileExt}`);

    // Procesare în funcție de tip fișier
    if (fileExt === 'csv') {
      products = await processCSV(file);
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      products = await processExcel(file);
    } else {
      return NextResponse.json(
        { error: `Format nesuportat: ${fileExt}. Folosiți CSV sau Excel (.xlsx, .xls)` },
        { status: 400 }
      );
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Nu s-au găsit produse în fișier' },
        { status: 400 }
      );
    }

    console.log(`Parsed ${products.length} products from file`);

    // Upload fișier original în Supabase Storage (opțional)
    const timestamp = Date.now();
    const storagePath = `catalogs/${timestamp}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('price-lists')
      .upload(storagePath, file);

    if (uploadError) {
      console.warn('Storage upload warning:', uploadError.message);
    }

    // Insert/Update produse în baza de date
    const productsToInsert = products.map(p => ({
      ...p,
      price_list_source: file.name,
      price_list_uploaded_at: new Date().toISOString()
    }));

    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .upsert(productsToInsert, { 
        onConflict: 'sku',
        ignoreDuplicates: false 
      })
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: `Eroare la salvare: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imported: insertedProducts?.length || 0,
      total_parsed: products.length,
      file_name: file.name,
      storage_path: uploadError ? null : storagePath
    });

  } catch (error: any) {
    console.error('Import catalog error:', error);
    return NextResponse.json(
      { error: `Import failed: ${error.message}` },
      { status: 500 }
    );
  }
}

async function processCSV(file: File): Promise<any[]> {
  const text = await file.text();
  
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header: string) => header.trim()
  });

  if (result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors);
  }

  return result.data.map((row: any) => normalizeProduct(row));
}

async function processExcel(file: File): Promise<any[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  // Use first sheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);

  return data.map((row: any) => normalizeProduct(row));
}

function normalizeProduct(rawData: any): any {
  // Generate slug from name
  const generateSlug = (name: string) => {
    if (!name) return `product-${Date.now()}`;
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Normalize column names (accept multiple variations)
  const name = rawData['Nume'] || rawData['Name'] || rawData['Produs'] || rawData['Product'] || '';
  const sku = rawData['SKU'] || rawData['Cod'] || rawData['Code'] || rawData['sku'] || `GEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const normalized = {
    sku: String(sku).trim(),
    name: String(name).trim(),
    slug: generateSlug(name),
    description: rawData['Descriere'] || rawData['Description'] || rawData['description'] || null,
    category: rawData['Categorie'] || rawData['Category'] || rawData['category'] || null,
    finish: rawData['Finisaj'] || rawData['Finish'] || rawData['finish'] || null,
    color: rawData['Culoare'] || rawData['Color'] || rawData['color'] || null,
    material: rawData['Material'] || rawData['material'] || null,
    width: parseFloat(rawData['Latime'] || rawData['Width'] || rawData['width'] || 0) || null,
    length: parseFloat(rawData['Lungime'] || rawData['Length'] || rawData['length'] || 0) || null,
    height: parseFloat(rawData['Inaltime'] || rawData['Height'] || rawData['height'] || 0) || null,
    weight: parseFloat(rawData['Greutate'] || rawData['Weight'] || rawData['weight'] || 0) || null,
    price_public_ttc: parseFloat(rawData['Pret'] || rawData['Price'] || rawData['price'] || rawData['Pret Public'] || 0) || 0,
    price_partner_net: parseFloat(rawData['Pret Partner'] || rawData['Partner Price'] || rawData['price_partner'] || 0) || 0,
    price_original: parseFloat(rawData['Pret Original'] || rawData['Original Price'] || rawData['price_original'] || 0) || null,
    stock_qty: parseInt(rawData['Stoc'] || rawData['Stock'] || rawData['stock'] || rawData['Qty'] || 0) || 0,
    gallery: []
  };

  // Handle gallery if present
  const galleryStr = rawData['Imagini'] || rawData['Images'] || rawData['gallery'] || rawData['Gallery'] || '';
  if (galleryStr && typeof galleryStr === 'string') {
    normalized.gallery = galleryStr.split(',').map((url: string) => url.trim()).filter(Boolean);
  }

  return normalized;
}
