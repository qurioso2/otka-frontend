// Test pentru API-ul de comenzi

async function testOrderAPI() {
  console.log('🔍 Testing Order API...');
  
  // Test GET (without auth) - should get 401
  try {
    const getResponse = await fetch('http://localhost:3000/api/partners/orders');
    console.log(`GET /api/partners/orders: ${getResponse.status} ${getResponse.statusText}`);
    
    if (getResponse.status === 401) {
      console.log('✅ API correctly requires authentication');
    } else {
      console.log('❌ API should require authentication');
    }
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
  
  // Test POST (without auth) - should get 401
  try {
    const postResponse = await fetch('http://localhost:3000/api/partners/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            manufacturerName: 'Apple',
            productCode: 'iPhone14-128GB',
            quantity: 2,
            finishCode: 'BLK'
          }
        ],
        partner_notes: 'Test order'
      })
    });
    
    console.log(`POST /api/partners/orders: ${postResponse.status} ${postResponse.statusText}`);
    
    if (postResponse.status === 401) {
      console.log('✅ API correctly requires authentication for POST');
    } else {
      console.log('❌ API should require authentication for POST');
    }
  } catch (error) {
    console.log('❌ Error testing POST API:', error.message);
  }
}

testOrderAPI();