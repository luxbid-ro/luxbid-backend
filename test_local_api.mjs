const API_BASE = 'http://localhost:4000';

async function testLocalAPI() {
  console.log('🚀 Testing local backend API...');
  
  // Test registration
  try {
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@luxbid.local',
        password: '***REMOVED***',
        personType: 'fizica',
        firstName: 'Test',
        lastName: 'User',
        phone: '0721234567',
        address: 'Test Address',
        city: 'București',
        county: 'București',
        postalCode: '010061',
        country: 'România'
      })
    });
    
    const userData = await registerRes.json();
    console.log('✅ Registration:', registerRes.ok ? 'Success' : userData.message);
    
    // Test login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@luxbid.local',
        password: '***REMOVED***'
      })
    });
    
    if (!loginRes.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful, got token');
    
    // Test listing creation
    const testListing = {
      title: 'TEST: Rolex Submariner Date',
      description: 'Test listing pentru verificare funcționalitate',
      category: 'Ceasuri',
      desiredPrice: 45000,
      currency: 'EUR'
    };
    
    const listingRes = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testListing)
    });
    
    if (listingRes.ok) {
      const listing = await listingRes.json();
      console.log('✅ Listing created successfully:', listing.title);
      console.log('🎉 Local backend is fully functional!');
    } else {
      const error = await listingRes.text();
      console.log('❌ Listing creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLocalAPI();
