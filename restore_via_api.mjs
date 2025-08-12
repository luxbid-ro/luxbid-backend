// Restore listings via API calls instead of direct database access

const API_BASE = 'https://luxbid-backend.onrender.com';

async function createDemoUser() {
  console.log('👤 Creating demo user...');
  
  const userData = {
    email: 'demo@luxbid.ro',
    password: '***REMOVED***',
    personType: 'fizica',
    firstName: 'Demo',
    lastName: 'User',
    phone: '+40700000000',
    address: 'Strada Demo 123',
    city: 'București',
    county: 'București',
    postalCode: '010101',
    country: 'România'
  };

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Demo user created successfully');
      return result.accessToken;
    } else {
      // User might already exist, try login
      console.log('User might exist, trying login...');
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, password: userData.password })
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ Demo user logged in successfully');
        return loginResult.accessToken;
      } else {
        throw new Error('Failed to create or login demo user');
      }
    }
  } catch (error) {
    console.error('❌ Error with demo user:', error.message);
    return null;
  }
}

async function createListing(token, listingData) {
  try {
    const response = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(listingData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created listing: ${listingData.title}`);
      return result;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create listing ${listingData.title}:`, error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating listing ${listingData.title}:`, error.message);
    return null;
  }
}

async function restoreListings() {
  console.log('🔄 Restoring listings via API...');

  // Create demo user and get token
  const token = await createDemoUser();
  if (!token) {
    console.error('❌ Cannot proceed without authentication token');
    return;
  }

  // Sample listings with Cloudinary placeholder images
  const sampleListings = [
    {
      title: 'Rolex Submariner 2023',
      description: 'Ceas de lux Rolex Submariner, model 2023, în stare perfectă. Vine cu cutie originală și certificat de autenticitate. Prețul este ferm.',
      category: 'Ceasuri',
      desiredPrice: 45000,
      currency: 'EUR',
      condition: 'Nou',
      brand: 'Rolex',
      model: 'Submariner',
      year: 2023,
      location: 'București',
      images: [
        'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=400&h=400&fit=crop&crop=center'
      ]
    },
    {
      title: 'Hermès Birkin Bag',
      description: 'Geantă Hermès Birkin din piele autentică, culoare negru, mărimea 35cm. Un investiție în stil și eleganță. Vine cu cutie și certificat de autenticitate.',
      category: 'Genți',
      desiredPrice: 25000,
      currency: 'EUR',
      condition: 'Foarte bună',
      brand: 'Hermès',
      model: 'Birkin',
      year: 2022,
      location: 'Cluj-Napoca',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center'
      ]
    },
    {
      title: 'Inel cu Diamant Tiffany & Co',
      description: 'Inel de logodnă Tiffany & Co cu diamant de 2 carate, aur alb 18k. Certificat GIA inclus. Piesa perfectă pentru momentele speciale.',
      category: 'Bijuterii',
      desiredPrice: 15000,
      currency: 'EUR',
      condition: 'Nou',
      brand: 'Tiffany & Co',
      model: 'Engagement Ring',
      year: 2023,
      location: 'Timișoara',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center'
      ]
    }
  ];

  // Create all listings
  for (const listing of sampleListings) {
    await createListing(token, listing);
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 Listing restoration complete!');
  
  // Check final result
  try {
    const response = await fetch(`${API_BASE}/listings`);
    if (response.ok) {
      const listings = await response.json();
      console.log(`📊 Total listings now: ${listings.length}`);
    }
  } catch (error) {
    console.log('Could not fetch final count');
  }
}

restoreListings();
