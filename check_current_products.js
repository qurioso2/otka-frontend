const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://kzwzqtghjnkrdjfosbdz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d3pxdGdoam5rcmRqZm9zYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTMwMDEsImV4cCI6MjA3NDIyOTAwMX0.h5EUWHDpcGNnf8N8iz8GLZcr03_QR6tmJCb2I7jPbuY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentProducts() {
  try {
    console.log('🔍 Checking current products...');
    
    const { data: products, error } = await supabase
      .from('products_public')
      .select('*');
    
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    console.log(`✅ Found ${products?.length || 0} products:`);
    products?.forEach(product => {
      console.log(`- ${product.sku}: ${product.name} (${product.price_public_ttc} RON, stock: ${product.stock_qty})`);
    });
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

checkCurrentProducts();