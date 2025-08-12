// Test simple listing creation

const API_BASE = 'https://luxbid-backend.onrender.com';

async function test() {
  // Login
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@luxbid.ro', password: '***REMOVED***' })
  });

  const { accessToken } = await loginResponse.json();
  console.log('✅ Logged in');

  // Create simple listing
  const listingData = {
    title: 'Test Anunt',
    description: 'Descriere test simpla',
    category: 'Test',
    desiredPrice: 1000
  };

  try {
    const response = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(listingData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Created listing:', result.title);
    } else {
      const error = await response.text();
      console.error('❌ Error:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

test();
