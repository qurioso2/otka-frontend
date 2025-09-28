// Test product creation
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateProduct() {
  try {
    // Login as admin
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@otka.ro',
      password: 'Parola!3'
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      return;
    }

    console.log('✅ Logged in as admin');

    // Test simple product creation
    const testProduct = {
      sku: 'TEST001',
      name: 'Produs Test',
      price_public_ttc: 100,
      price_partner_net: 80,
      stock_qty: 10,
      description: 'Test product',
      gallery: []
    };

    console.log('📦 Creating product:', testProduct);

    const response = await fetch('https://otka.ro/api/admin/products/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct)
    });

    const result = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', result);

    if (response.ok) {
      console.log('✅ Product created successfully');
    } else {
      console.log('❌ Failed to create product');
    }

  } catch (error) {
    console.log('💥 Error:', error.message);
  } finally {
    await supabase.auth.signOut();
  }
}

testCreateProduct();