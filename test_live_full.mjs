const API_BASE = 'https://luxbid-backend.onrender.com';

async function testLiveEndpoints() {
  console.log('🔍 Testing all live backend endpoints...');
  
  try {
    // Test auth register
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testfull@luxbid.ro',
        password: '***REMOVED***',
        personType: 'fizica',
        firstName: 'Test',
        lastName: 'Full',
        phone: '0721234567',
        address: 'Test Address',
        city: 'București',
        county: 'București',
        postalCode: '010061',
        country: 'România'
      })
    });
    
    console.log('✅ Register status:', registerRes.status);
    
    // Test auth login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testfull@luxbid.ro',
        password: '***REMOVED***'
      })
    });
    
    console.log('✅ Login status:', loginRes.status);
    
    if (loginRes.ok) {
      const loginData = await loginRes.json();
      console.log('✅ Token received, length:', loginData.accessToken?.length || 'NONE');
      
      // Test protected endpoint - users/me
      const userRes = await fetch(`${API_BASE}/users/me`, {
        headers: { 'Authorization': `Bearer ${loginData.accessToken}` }
      });
      
      console.log('🔐 Users/me status:', userRes.status);
      
      if (userRes.ok) {
        const userData = await userRes.json();
        console.log('✅ User data:', userData.email);
        
        // Test listings creation
        const listingRes = await fetch(`${API_BASE}/listings`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.accessToken}`
          },
          body: JSON.stringify({
            title: 'Test Live Listing',
            description: 'Test pentru backend live',
            category: 'Ceasuri',
            desiredPrice: 1000,
            currency: 'EUR'
          })
        });
        
        console.log('📝 Listing creation status:', listingRes.status);
        
        if (listingRes.ok) {
          console.log('🎉 LIVE BACKEND IS FULLY FUNCTIONAL!');
        } else {
          const error = await listingRes.text();
          console.log('❌ Listing error:', error.substring(0, 200));
        }
      } else {
        const error = await userRes.text();
        console.log('❌ Users/me error:', error.substring(0, 200));
      }
    }
    
    // Test all available endpoints
    console.log('\n📋 Testing all endpoints:');
    const endpoints = [
      { path: '/health', method: 'GET' },
      { path: '/listings', method: 'GET' },
      { path: '/notifications/unread-count', method: 'GET' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`${API_BASE}${endpoint.path}`);
        console.log(`${endpoint.method} ${endpoint.path}: ${res.status}`);
      } catch (e) {
        console.log(`${endpoint.method} ${endpoint.path}: ERROR`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLiveEndpoints();
