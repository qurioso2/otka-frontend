// Test admin connection and authentication
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Testing Admin Dashboard Connection ===');
console.log('Supabase URL:', supabaseUrl ? 'Set ✅' : 'Missing ❌');
console.log('Supabase Key:', supabaseAnonKey ? 'Set ✅' : 'Missing ❌');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n=== Testing Database Connection ===');
    
    // Test basic connection
    const { data: products, error: productError } = await supabase
      .from('products_public')
      .select('id')
      .limit(1);
    
    if (productError) {
      console.log('❌ Database connection failed:', productError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test users table access
    console.log('\n=== Testing Users Table Access ===');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('email, role')
      .eq('role', 'admin')
      .limit(5);
    
    if (userError) {
      console.log('❌ Users table access failed:', userError.message);
      console.log('This might be due to RLS policies requiring authentication');
    } else {
      console.log('✅ Users table accessible');
      console.log('Admin users found:', users?.length || 0);
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.role})`);
        });
      }
    }
    
    // Test auth flow
    console.log('\n=== Testing Auth Flow ===');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Current user:', user ? `${user.email} ✅` : 'None (not authenticated) ⚠️');
    
    if (!user) {
      console.log('🔍 This is expected for server-side testing without auth session');
      console.log('The admin dashboard requires a logged-in user with admin role');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testConnection();