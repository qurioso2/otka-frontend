// Script pentru verificarea existenței tabelelor în Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    console.log('🔍 Verificare existență tabele pentru sistemul de comenzi...');
    
    // Test partner_orders table
    const { data: orders, error: ordersError } = await supabase
      .from('partner_orders')
      .select('id')
      .limit(1);
    
    if (ordersError) {
      console.log('❌ Tabelul partner_orders nu există sau nu este accesibil');
      console.log('Error:', ordersError.message);
    } else {
      console.log('✅ Tabelul partner_orders există și este accesibil');
    }
    
    // Test partner_order_items table  
    const { data: items, error: itemsError } = await supabase
      .from('partner_order_items')
      .select('id')
      .limit(1);
      
    if (itemsError) {
      console.log('❌ Tabelul partner_order_items nu există sau nu este accesibil');
      console.log('Error:', itemsError.message);
    } else {
      console.log('✅ Tabelul partner_order_items există și este accesibil');
    }
    
    // Test partner_resources table
    const { data: resources, error: resourcesError } = await supabase
      .from('partner_resources')
      .select('id')
      .limit(1);
      
    if (resourcesError) {
      console.log('❌ Tabelul partner_resources nu există sau nu este accesibil');
      console.log('Error:', resourcesError.message);
    } else {
      console.log('✅ Tabelul partner_resources există și este accesibil');
      console.log(`📊 Găsite ${resources.length} resurse în baza de date`);
    }
    
    console.log('\n🚀 Verificare completă!');
    
  } catch (error) {
    console.error('❌ Eroare la verificarea tabelelor:', error);
  }
}

checkTables();