const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kzwzqtghjnkrdjfosbdz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d3pxdGdoam5rcmRqZm9zYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTMwMDEsImV4cCI6MjA3NDIyOTAwMX0.h5EUWHDpcGNnf8N8iz8GLZcr03_QR6tmJCb2I7jPbuY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testHomepageQuery() {
  try {
    console.log('🔍 Testing homepage query...');
    
    // Exact query from page.tsx
    const { data: products, error } = await supabase
      .from("products_public")
      .select("id,sku,name,slug,price_public_ttc,stock_qty,gallery")
      .order("id", { ascending: false })
      .limit(24);
    
    if (error) {
      console.log('❌ Homepage query error:', error.message);
      console.log('Error details:', error);
      return;
    }
    
    console.log('✅ Homepage query successful');
    console.log(`📦 Found ${products?.length || 0} products`);
    
    if (products && products.length > 0) {
      console.log('📋 First product:', JSON.stringify(products[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testHomepageQuery();