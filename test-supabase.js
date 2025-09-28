const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://kzwzqtghjnkrdjfosbdz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6d3pxdGdoam5rcmRqZm9zYmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTMwMDEsImV4cCI6MjA3NDIyOTAwMX0.h5EUWHDpcGNnf8N8iz8GLZcr03_QR6tmJCb2I7jPbuY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.log('❌ Connection failed:', healthError.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (productsError) {
      console.log('❌ Products table error:', productsError.message);
    } else {
      console.log('✅ Products table accessible');
    }
    
    // Test partner_orders table
    const { data: orders, error: ordersError } = await supabase
      .from('partner_orders')
      .select('id')
      .limit(1);
      
    if (ordersError) {
      console.log('❌ Partner orders table error:', ordersError.message);
    } else {
      console.log('✅ Partner orders table accessible');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testConnection();