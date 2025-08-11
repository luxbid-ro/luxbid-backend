const API_BASE = 'http://luxbid-backend.onrender.com';

const sampleListings = [
  {
    title: 'Rolex Submariner Date - Stare Perfectă',
    description: 'Ceas de lux Rolex Submariner Date, model 126610LN din 2023. Carcasă din oțel inoxidabil de 41mm, brățară Oyster, rezistent la apă până la 300m. Mecanismul perpetual, certificat cronometru. Vine cu cutia originală, certificatul și garanția. Purtat foarte rar, stare impecabilă.',
    category: 'Ceasuri',
    desiredPrice: 45000,
    currency: 'EUR'
  },
  {
    title: 'Patek Philippe Nautilus - Investiție de Colecție',
    description: 'Patek Philippe Nautilus 5711/1A-010, unul dintre cele mai căutate ceasuri din lume. Carcasă din oțel inoxidabil de 40mm, cadran albastru iconic, brățară integrată. O adevărată investiție în timp.',
    category: 'Ceasuri',
    desiredPrice: 85000,
    currency: 'EUR'
  },
  {
    title: 'Omega Speedmaster Professional - Moon Watch',
    description: 'Omega Speedmaster Professional "Moon Watch", modelul care a fost pe Lună. Carcasă din oțel de 42mm, cronograf manual, cristal hesalite. Serviciat recent la Omega.',
    category: 'Ceasuri',
    desiredPrice: 6500,
    currency: 'EUR'
  },
  {
    title: 'Hermès Birkin 30 - Piele de Crocodil Negru',
    description: 'Hermès Birkin 30cm din piele de crocodil Porosus negru cu hardware-uri aurii. Include cutia originală, dust bag, clochette cu lacăt și chei. Investiție sigură în lux.',
    category: 'Genți',
    desiredPrice: 85000,
    currency: 'EUR'
  },
  {
    title: 'Chanel Classic Flap - Quilted Lambskin Bej',
    description: 'Chanel Classic Flap Medium din piele de miel matlasată bej cu hardware-uri aurii. Lanțul iconic și logo-ul CC. Vine cu cartea de autenticitate și dust bag-ul original.',
    category: 'Genți',
    desiredPrice: 8500,
    currency: 'EUR'
  }
];

async function createSampleListings() {
  console.log('🚀 Creating 5 sample listings on local backend...');
  
  try {
    // Register demo user
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@luxbid.local',
        password: '***REMOVED***',
        personType: 'fizica',
        firstName: 'Demo',
        lastName: 'User',
        phone: '0721234567',
        address: 'Calea Victoriei 15',
        city: 'București',
        county: 'București',
        postalCode: '010061',
        country: 'România'
      })
    });
    
    console.log('✅ User registered');
    
    // Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@luxbid.local',
        password: '***REMOVED***'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful');
    
    // Create listings
    let created = 0;
    for (const listing of sampleListings) {
      try {
        const res = await fetch(`${API_BASE}/listings`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(listing)
        });
        
        if (res.ok) {
          created++;
          console.log(`✅ Created: ${listing.title}`);
        } else {
          const error = await res.text();
          console.log(`❌ Failed: ${listing.title} - ${error}`);
        }
      } catch (e) {
        console.log(`❌ Error: ${listing.title} - ${e.message}`);
      }
    }
    
    console.log(`🎉 Created ${created}/${sampleListings.length} listings!`);
    
    // Verify listings
    const listingsRes = await fetch(`${API_BASE}/listings`);
    const listings = await listingsRes.json();
    console.log(`📊 Total listings in database: ${listings.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createSampleListings();
