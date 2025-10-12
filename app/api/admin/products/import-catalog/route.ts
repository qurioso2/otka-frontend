import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/app/auth/server';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase();

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
        { error: 'Nu s-au găsit produse în fișier sau formatele coloanelor nu sunt corecte' },
        { status: 400 }
      );
    }

    console.log(`Parsed ${products.length} products, inserting to database...`);

    // Upload la Supabase Storage pentru referință
    const timestamp = Date.now();
    const storagePath = `catalogs/${timestamp}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('price-lists')
      .upload(storagePath, file);

    if (uploadError) {
      console.warn('Storage upload warning:', uploadError.message);
    }

    // Insert produse în baza de date cu upsert (update dacă SKU există)
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .upsert(products, { 
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
  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products = results.data.map((row: any) => normalizeProductData(row));
        resolve(products.filter(Boolean));
      }
    });
  });
}

async function processExcel(file: File): Promise<any[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  return rawData.map((row: any) => normalizeProductData(row)).filter(Boolean);
}

function normalizeProductData(rawData: any): any {
  // Mapare flexibilă pentru diferite formate de coloane
  const normalized = {
    sku: rawData['SKU'] || rawData['Cod'] || rawData['cod'] || rawData['Code'] || rawData['sku'] || `AUTO-${Date.now()}-${Math.random()}`,
    name: rawData['Nume'] || rawData['Name'] || rawData['Produs'] || rawData['Product'] || rawData['name'] || '',
    slug: '', // Va fi generat automat
    description: rawData['Descriere'] || rawData['Description'] || rawData['description'] || null,
    category: rawData['Categorie'] || rawData['Category'] || rawData['category'] || 'Import',
    price_public_ttc: parseFloat(rawData['Preț'] || rawData['Price'] || rawData['Pret'] || rawData['price_public_ttc'] || '0') || 0,
    price_partner_net: parseFloat(rawData['Preț Partener'] || rawData['Partner Price'] || rawData['price_partner_net'] || '0') || 0,
    stock_qty: parseInt(rawData['Stoc'] || rawData['Stock'] || rawData['Cantitate'] || rawData['stock_qty'] || '0') || 0,
    finish: rawData['Finisaj'] || rawData['Finish'] || rawData['finish'] || null,
    color: rawData['Culoare'] || rawData['Color'] || rawData['color'] || null,
    material: rawData['Material'] || rawData['material'] || null,
    width: parseFloat(rawData['Lățime'] || rawData['Width'] || rawData['width'] || '0') || null,
    length: parseFloat(rawData['Lungime'] || rawData['Length'] || rawData['length'] || '0') || null,
    height: parseFloat(rawData['Înălțime'] || rawData['Height'] || rawData['height'] || '0') || null,
    weight: parseFloat(rawData['Greutate'] || rawData['Weight'] || rawData['weight'] || '0') || null,
    gallery: [],
    price_list_source: 'Catalog Import',
    price_list_uploaded_at: new Date().toISOString(),
  };

  // Generare slug din nume
  if (normalized.name) {
    normalized.slug = normalized.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100); // Limită lungime
  }

  // Validare minimă
  if (!normalized.name || !normalized.sku) {
    return null;
  }

  // Handle gallery if present
  const galleryStr = rawData['Imagini'] || rawData['Images'] || rawData['gallery'] || rawData['Gallery'] || '';
  if (galleryStr && typeof galleryStr === 'string') {
    normalized.gallery = galleryStr.split(',').map((url: string) => url.trim()).filter(Boolean);
  }

  return normalized;
}
