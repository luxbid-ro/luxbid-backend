// Create listings via API calls to live backend
const API_BASE = 'https://luxbid-backend.onrender.com';

const sampleListings = [
  // CEASURI
  {
    title: 'Rolex Submariner Date - Stare Perfectă',
    description: 'Ceas de lux Rolex Submariner Date, model 126610LN din 2023. Carcasă din oțel inoxidabil de 41mm, brățară Oyster, rezistent la apă până la 300m. Mecanismul perpetual, certificat cronometru. Vine cu cutia originală, certificatul și garanția. Purtat foarte rar, stare impecabilă.',
    category: 'Ceasuri',
    desiredPrice: 45000,
    currency: 'EUR'
  },
  {
    title: 'Patek Philippe Nautilus - Investiție de Colecție',
    description: 'Patek Philippe Nautilus 5711/1A-010, unul dintre cele mai căutate ceasuri din lume. Carcasă din oțel inoxidabil de 40mm, cadran albastru iconic, brățară integrată. Mecanismul automatic calibru 324 S C. Fabricat în 2021, cu toate documentele originale. O adevărată investiție în timp.',
    category: 'Ceasuri',
    desiredPrice: 85000,
    currency: 'EUR'
  },
  {
    title: 'Omega Speedmaster Professional - Moon Watch',
    description: 'Omega Speedmaster Professional "Moon Watch", modelul care a fost pe Lună. Carcasă din oțel de 42mm, cronograf manual, cristal hesalite. Mecanismul legendary 1861. Vine cu cutia și documentele complete. Serviciat recent la Omega, funcționează perfect.',
    category: 'Ceasuri',
    desiredPrice: 6500,
    currency: 'EUR'
  },
  {
    title: 'Cartier Santos - Eleganță Clasică',
    description: 'Cartier Santos de Cartier, mărimea mare 39.8mm. Carcasă din oțel inoxidabil cu șuruburi aurii, cadran alb cu cifre romane. Brățară din oțel cu sistem QuickSwitch. Mecanismul automatic 1847 MC. Purtat ocazional, în stare excelentă.',
    category: 'Ceasuri',
    desiredPrice: 7200,
    currency: 'EUR'
  },
  {
    title: 'TAG Heuer Monaco - Steve McQueen Edition',
    description: 'TAG Heuer Monaco CAW2111, iconic design pătrat inspirat de Steve McQueen. Carcasă din oțel de 39mm, cadran albastru, cronograf automatic. Curea din piele albastră premium. Ediție limitată, foarte căutată de colecționari. Stare impecabilă.',
    category: 'Ceasuri',
    desiredPrice: 4800,
    currency: 'EUR'
  },
  // GENȚI
  {
    title: 'Hermès Birkin 30 - Piele de Crocodil Negru',
    description: 'Hermès Birkin 30cm din piele de crocodil Porosus negru cu hardware-uri aurii. Anul fabricației 2022, stamp-ul Z. Include cutia originală, dust bag, clochette cu lacăt și chei. Stare pristine, purtată de doar câteva ori. Investiție sigură în lux.',
    category: 'Genți',
    desiredPrice: 85000,
    currency: 'EUR'
  },
  {
    title: 'Chanel Classic Flap - Quilted Lambskin Bej',
    description: 'Chanel Classic Flap Medium din piele de miel matlasată bej cu hardware-uri aurii. Lanțul iconic și logo-ul CC. Interiorul din piele burgundy cu buzunare multiple. Vine cu cartea de autenticitate și dust bag-ul original. Purtată cu grijă.',
    category: 'Genți',
    desiredPrice: 8500,
    currency: 'EUR'
  },
  {
    title: 'Louis Vuitton Neverfull MM - Monogram Canvas',
    description: 'Louis Vuitton Neverfull MM în monogram canvas clasic cu trim-uri din piele naturală. Interior roșu spacios cu buzunar cu fermoar. Vine cu pochette-ul detașabil. Perfectă pentru zi sau călătorii. Stare foarte bună, urme minime de uzură.',
    category: 'Genți',
    desiredPrice: 1800,
    currency: 'EUR'
  },
  {
    title: 'Gucci Dionysus - Piele Supreme cu Broderie',
    description: 'Gucci Dionysus din canvas GG Supreme cu broderie florală și aplicații din piele. Închiderea tiger head iconică din metal antic. Lanțul detașabil permite purtarea pe umăr sau cross-body. Colecția limitată, foarte căutată.',
    category: 'Genți',
    desiredPrice: 3200,
    currency: 'EUR'
  },
  {
    title: 'Bottega Veneta Cassette - Intrecciato Verde',
    description: 'Bottega Veneta Cassette bag în tehnica Intrecciato din piele verde. Design geometric distinctiv, foarte trendy. Lanțul auriu chunky și închiderea magnetică. Dimensiuni perfecte pentru seri sau evenimente speciale. Stare impecabilă.',
    category: 'Genți',
    desiredPrice: 2800,
    currency: 'EUR'
  },
  // BIJUTERII
  {
    title: 'Inel cu Diamant Solitaire 3 Carate - Certificat GIA',
    description: 'Inel de logodnă cu diamant solitaire de 3.02 carate, tăietura brilliant rotund. Claritate VVS1, culoare D (exceptional white). Certificat GIA inclus. Montura din platină 950, design clasic Tiffany. Evaluare recentă la 45.000 EUR. Investiție sigură în diamante premium.',
    category: 'Bijuterii',
    desiredPrice: 42000,
    currency: 'EUR'
  },
  {
    title: 'Colier Cartier Love - Aur Alb 18K cu Diamante',
    description: 'Colier Cartier Love din aur alb 18K cu diamante pavé. Design iconic cu șuruburile distinctive. Lanț de 42cm, perfectă lungime. Vine cu certificatul de autenticitate Cartier și cutia originală. Stare impecabilă, purtat de câteva ori.',
    category: 'Bijuterii',
    desiredPrice: 15000,
    currency: 'EUR'
  },
  {
    title: 'Brățară Tennis cu Diamante - 5 Carate Total',
    description: 'Brățară tennis cu 50 de diamante round brilliant, 5 carate în total. Fiecare diamant F-G color, VS clarity. Lungime 18cm cu închidere sigură. Setare în aur alb 18K. Perfect pentru evenimente speciale sau cadou de lux. Evaluare recentă inclusă.',
    category: 'Bijuterii',
    desiredPrice: 25000,
    currency: 'EUR'
  },
  {
    title: 'Cercei cu Perle South Sea - Aur Galben 18K',
    description: 'Cercei cu perle South Sea naturale de 12mm, culoare aurie. Luster exceptional, formă aproape perfectă. Monturi din aur galben 18K cu accent de diamante. Perle cultivate în Australia, certificat de autenticitate inclus. Rafinament și eleganță.',
    category: 'Bijuterii',
    desiredPrice: 8500,
    currency: 'EUR'
  },
  {
    title: 'Ceas-Bijuterie Chopard Happy Diamonds',
    description: 'Chopard Happy Diamonds, ceas-bijuterie din aur roz 18K cu diamante mobile. Cadran cu 7 diamante care "dansează" liber între două cristale de safir. Curea din piele crocodil roz. Mișcare de cuarț swiss. Bijuterie funcțională de excepție.',
    category: 'Bijuterii',
    desiredPrice: 18000,
    currency: 'EUR'
  },
  // ARTĂ
  {
    title: 'Tablou Ulei pe Pânză - Adrian Ghenie (2018)',
    description: 'Operă originală de Adrian Ghenie din 2018, ulei pe pânză, 100x80cm. Titlul "Reflexii Urbane". Semnat în dreapta jos, cu certificat de autenticitate de la galeria reprezentantă. Școala românească contemporană, artist recunoscut internațional. Provenință: colecție privată București.',
    category: 'Artă',
    desiredPrice: 35000,
    currency: 'EUR'
  },
  {
    title: 'Sculptură Bronz - Constantin Brâncuși (Replică Autorizată)',
    description: 'Replică autorizată din bronz după "Măiastra" de Constantin Brâncuși. Realizată de Fundația Brâncuși în 1995, numărul 15/50. Înălțime 45cm, pe soclu din marmură Ruschița. Certificat de autenticitate și documentația completă. Piesă de colecție cu valoare istorică.',
    category: 'Artă',
    desiredPrice: 25000,
    currency: 'EUR'
  },
  {
    title: 'Litografie Salvador Dalí - "La Persistance de la Mémoire"',
    description: 'Litografie originală Salvador Dalí din 1974, "La Persistance de la Mémoire". Ediție limitată 150/300, semnată în creion de artist. Dimensiuni 70x50cm, înrămată profesional. Certificat de la Dalí Foundation. Stare de conservare perfectă, păstrată departe de lumină.',
    category: 'Artă',
    desiredPrice: 18000,
    currency: 'EUR'
  },
  {
    title: 'Fotografie de Artă - Helmut Newton "Big Nudes"',
    description: 'Fotografie originală Helmut Newton din seria "Big Nudes", 1980. Print gelatin silver, 50x60cm. Semnată pe verso de fotograf. Provenință: Galerie Gmurzynska, Zürich. Una dintre cele mai iconice serii ale marelui fotograf. Investiție sigură în fotografia de artă.',
    category: 'Artă',
    desiredPrice: 12000,
    currency: 'EUR'
  },
  {
    title: 'Ceramică Artă Contemporană - Grayson Perry "Essex House"',
    description: 'Vas ceramic Grayson Perry "Essex House" din 2017. Înălțime 35cm, glazură colorată cu motivele caracteristice artistului. Piesă unică, nu replică. Turner Prize winner, artist britanic de renume mondial. Achiziționat direct de la White Cube Gallery, Londra.',
    category: 'Artă',
    desiredPrice: 22000,
    currency: 'EUR'
  }
];

async function createListingsViaAPI() {
  console.log('🚀 Creating listings via live API...');
  
  // First register a demo user
  try {
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@luxbid.ro',
        password: '***REMOVED***',
        personType: 'fizica',
        firstName: 'Alexandru',
        lastName: 'Popescu',
        phone: '0721234567',
        address: 'Calea Victoriei 15',
        city: 'București',
        county: 'București',
        postalCode: '010061',
        country: 'România'
      })
    });
    
    const userData = await registerRes.json();
    console.log(registerRes.ok ? '✅ User registered' : '⚠️ User exists:', userData.message || 'OK');
    
    // Login to get token
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@luxbid.ro',
        password: '***REMOVED***'
      })
    });
    
    if (!loginRes.ok) {
      console.error('❌ Login failed');
      return;
    }
    
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
          console.log(`❌ Failed: ${listing.title}`);
        }
      } catch (e) {
        console.log(`❌ Error: ${listing.title}`);
      }
    }
    
    console.log(`🎉 Created ${created}/${sampleListings.length} listings!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createListingsViaAPI();
