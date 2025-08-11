const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleListings() {
  console.log('🚀 Creating sample listings for luxbid.ro...');

  // First, create a test user if not exists
  let testUser = await prisma.user.findUnique({
    where: { email: 'demo@luxbid.ro' }
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'demo@luxbid.ro',
        password: '$2b$12$hashedpassword', // bcrypt hash for '***REMOVED***'
        personType: 'FIZICA',
        firstName: 'Alexandru',
        lastName: 'Popescu',
        phone: '0721234567',
        address: 'Calea Victoriei 15',
        city: 'București',
        county: 'București',
        postalCode: '010061',
        country: 'România'
      }
    });
  }

  // CEASURI - 5 anunțuri premium
  const ceasuri = [
    {
      title: 'Rolex Submariner Date - Stare Perfectă',
      description: 'Ceas de lux Rolex Submariner Date, model 126610LN din 2023. Carcasă din oțel inoxidabil de 41mm, brațară Oyster, rezistent la apă până la 300m. Mecanismul perpetual, certificat cronometru. Vine cu cutia originală, certificatul și garanția. Purtat foarte rar, stare impecabilă.',
      category: 'Ceasuri',
      price: 45000,
      currency: 'EUR',
      condition: 'Ca nou',
      brand: 'Rolex',
      model: 'Submariner Date 126610LN',
      year: 2023,
      location: 'București',
      images: [
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Patek Philippe Nautilus - Investiție de Colecție',
      description: 'Patek Philippe Nautilus 5711/1A-010, unul dintre cele mai căutate ceasuri din lume. Carcasă din oțel inoxidabil de 40mm, cadran albastru iconic, brățară integrată. Mecanismul automatic calibru 324 S C. Fabricat în 2021, cu toate documentele originale. O adevărată investiție în timp.',
      category: 'Ceasuri',
      price: 85000,
      currency: 'EUR',
      condition: 'Perfectă',
      brand: 'Patek Philippe',
      model: 'Nautilus 5711/1A-010',
      year: 2021,
      location: 'Cluj-Napoca',
      images: [
        'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Omega Speedmaster Professional - Moon Watch',
      description: 'Omega Speedmaster Professional "Moon Watch", modelul care a fost pe Lună. Carcasă din oțel de 42mm, cronograf manual, cristal hesalite. Mecanismul legendary 1861. Vine cu cutia și documentele complete. Serviciat recent la Omega, funcționează perfect.',
      category: 'Ceasuri',
      price: 6500,
      currency: 'EUR',
      condition: 'Excelentă',
      brand: 'Omega',
      model: 'Speedmaster Professional',
      year: 2022,
      location: 'Timișoara',
      images: [
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Cartier Santos - Eleganță Clasică',
      description: 'Cartier Santos de Cartier, mărimea mare 39.8mm. Carcasă din oțel inoxidabil cu șuruburi aurii, cadran alb cu cifre romane. Brățară din oțel cu sistem QuickSwitch. Mecanismul automatic 1847 MC. Purtat ocazional, în stare excelentă.',
      category: 'Ceasuri',
      price: 7200,
      currency: 'EUR',
      condition: 'Foarte bună',
      brand: 'Cartier',
      model: 'Santos de Cartier Large',
      year: 2023,
      location: 'Iași',
      images: [
        'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'TAG Heuer Monaco - Steve McQueen Edition',
      description: 'TAG Heuer Monaco CAW2111, iconic design pătrat inspirat de Steve McQueen. Carcasă din oțel de 39mm, cadran albastru, cronograf automatic. Curea din piele albastră premium. Ediție limitată, foarte căutată de colecționari. Stare impecabilă.',
      category: 'Ceasuri',
      price: 4800,
      currency: 'EUR',
      condition: 'Ca nou',
      brand: 'TAG Heuer',
      model: 'Monaco CAW2111',
      year: 2022,
      location: 'Constanța',
      images: [
        'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&h=600&fit=crop'
      ]
    }
  ];

  for (const ceas of ceasuri) {
    await prisma.listing.create({
      data: { ...ceas, userId: testUser.id }
    });
  }

  // GENȚI - 5 anunțuri de lux
  const genti = [
    {
      title: 'Hermès Birkin 30 - Piele de Crocodil Negru',
      description: 'Hermès Birkin 30cm din piele de crocodil Porosus negru cu hardware-uri aurii. Anul fabricației 2022, stamp-ul Z. Include cutia originală, dust bag, clochette cu lacăt și chei. Stare pristine, purtată de doar câteva ori. Investiție sigură în lux.',
      category: 'Genți',
      price: 85000,
      currency: 'EUR',
      condition: 'Ca nou',
      brand: 'Hermès',
      model: 'Birkin 30 Crocodile',
      year: 2022,
      location: 'București',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Chanel Classic Flap - Quilted Lambskin Bej',
      description: 'Chanel Classic Flap Medium din piele de miel matlasată bej cu hardware-uri aurii. Lanțul iconic și logo-ul CC. Interiorul din piele burgundy cu buzunare multiple. Vine cu cartea de autenticitate și dust bag-ul original. Purtată cu grijă.',
      category: 'Genți',
      price: 8500,
      currency: 'EUR',
      condition: 'Excelentă',
      brand: 'Chanel',
      model: 'Classic Flap Medium',
      year: 2023,
      location: 'Cluj-Napoca',
      images: [
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Louis Vuitton Neverfull MM - Monogram Canvas',
      description: 'Louis Vuitton Neverfull MM în monogram canvas clasic cu trim-uri din piele naturală. Interior roșu spacios cu buzunar cu fermoar. Vine cu pochette-ul detașabil. Perfectă pentru zi sau călătorii. Stare foarte bună, urme minime de uzură.',
      category: 'Genți',
      price: 1800,
      currency: 'EUR',
      condition: 'Foarte bună',
      brand: 'Louis Vuitton',
      model: 'Neverfull MM Monogram',
      year: 2023,
      location: 'Timișoara',
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Gucci Dionysus - Piele Supreme cu Broderie',
      description: 'Gucci Dionysus din canvas GG Supreme cu broderie florală și aplicații din piele. Închiderea tiger head iconică din metal antic. Lanțul detașabil permite purtarea pe umăr sau cross-body. Colecția limitată, foarte căutată.',
      category: 'Genți',
      price: 3200,
      currency: 'EUR',
      condition: 'Ca nou',
      brand: 'Gucci',
      model: 'Dionysus Supreme Embroidered',
      year: 2023,
      location: 'Brașov',
      images: [
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Bottega Veneta Cassette - Intrecciato Verde',
      description: 'Bottega Veneta Cassette bag în tehnica Intrecciato din piele verde. Design geometric distinctiv, foarte trendy. Lanțul auriu chunky și închiderea magnetică. Dimensiuni perfecte pentru seri sau evenimente speciale. Stare impecabilă.',
      category: 'Genți',
      price: 2800,
      currency: 'EUR',
      condition: 'Perfectă',
      brand: 'Bottega Veneta',
      model: 'Cassette Intrecciato',
      year: 2023,
      location: 'Sibiu',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=600&fit=crop'
      ]
    }
  ];

  for (const geanta of genti) {
    await prisma.listing.create({
      data: { ...geanta, userId: testUser.id }
    });
  }

  console.log('✅ Created 10 listings (Ceasuri + Genți)');
  console.log('⏳ Creating Bijuterii and Artă...');
}

createSampleListings()
  .then(() => console.log('🎉 Sample listings created successfully!'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());

  // BIJUTERII - 5 anunțuri de înaltă calitate
  const bijuterii = [
    {
      title: 'Inel cu Diamant Solitaire 3 Carate - Certificat GIA',
      description: 'Inel de logodnă cu diamant solitaire de 3.02 carate, tăietura brilliant rotund. Claritate VVS1, culoare D (exceptional white). Certificat GIA inclus. Montura din platină 950, design clasic Tiffany. Evaluare recentă la 45.000 EUR. Investiție sigură în diamante premium.',
      category: 'Bijuterii',
      price: 42000,
      currency: 'EUR',
      condition: 'Perfectă',
      brand: 'Tiffany & Co',
      model: 'Solitaire Setting',
      year: 2023,
      location: 'București',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Colier Cartier Love - Aur Alb 18K cu Diamante',
      description: 'Colier Cartier Love din aur alb 18K cu diamante pavé. Design iconic cu șuruburile distinctive. Lanț de 42cm, perfectă lungime. Vine cu certificatul de autenticitate Cartier și cutia originală. Stare impecabilă, purtat de câteva ori.',
      category: 'Bijuterii',
      price: 15000,
      currency: 'EUR',
      condition: 'Ca nou',
      brand: 'Cartier',
      model: 'Love Necklace Diamond Pavé',
      year: 2022,
      location: 'Cluj-Napoca',
      images: [
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Brățară Tennis cu Diamante - 5 Carate Total',
      description: 'Brățară tennis cu 50 de diamante round brilliant, 5 carate în total. Fiecare diamant F-G color, VS clarity. Lungime 18cm cu închidere sigură. Setare în aur alb 18K. Perfect pentru evenimente speciale sau cadou de lux. Evaluare recentă inclusă.',
      category: 'Bijuterii',
      price: 25000,
      currency: 'EUR',
      condition: 'Excelentă',
      brand: 'Harry Winston',
      model: 'Classic Tennis Bracelet',
      year: 2023,
      location: 'Timișoara',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Cercei cu Perle South Sea - Aur Galben 18K',
      description: 'Cercei cu perle South Sea naturale de 12mm, culoare aurie. Luster exceptional, formă aproape perfectă. Monturi din aur galben 18K cu accent de diamante. Perle cultivate în Australia, certificat de autenticitate inclus. Rafinament și eleganță.',
      category: 'Bijuterii',
      price: 8500,
      currency: 'EUR',
      condition: 'Perfectă',
      brand: 'Mikimoto',
      model: 'South Sea Pearl Earrings',
      year: 2023,
      location: 'Iași',
      images: [
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Ceas-Bijuterie Chopard Happy Diamonds',
      description: 'Chopard Happy Diamonds, ceas-bijuterie din aur roz 18K cu diamante mobile. Cadran cu 7 diamante care "dansează" liber între două cristale de safir. Curea din piele crocodil roz. Mișcare de cuarț swiss. Bijuterie funcțională de excepție.',
      category: 'Bijuterii',
      price: 18000,
      currency: 'EUR',
      condition: 'Ca nou',
      brand: 'Chopard',
      model: 'Happy Diamonds Icons',
      year: 2022,
      location: 'Constanța',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop'
      ]
    }
  ];

  for (const bijuterie of bijuterii) {
    await prisma.listing.create({
      data: { ...bijuterie, userId: testUser.id }
    });
  }

  // ARTĂ - 5 piese de colecție
  const arta = [
    {
      title: 'Tablou Ulei pe Pânză - Adrian Ghenie (2018)',
      description: 'Operă originală de Adrian Ghenie din 2018, ulei pe pânză, 100x80cm. Titlul "Reflexii Urbane". Semnat în dreapta jos, cu certificat de autenticitate de la galeria reprezentantă. Școala românească contemporană, artist recunoscut internațional. Provenință: colecție privată București.',
      category: 'Artă',
      price: 35000,
      currency: 'EUR',
      condition: 'Perfectă',
      brand: 'Adrian Ghenie',
      model: 'Reflexii Urbane',
      year: 2018,
      location: 'București',
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Sculptură Bronz - Constantin Brâncuși (Replică Autorizată)',
      description: 'Replică autorizată din bronz după "Măiastra" de Constantin Brâncuși. Realizată de Fundația Brâncuși în 1995, numărul 15/50. Înălțime 45cm, pe soclu din marmură Ruschița. Certificat de autenticitate și documentația completă. Piesă de colecție cu valoare istorică.',
      category: 'Artă',
      price: 25000,
      currency: 'EUR',
      condition: 'Excelentă',
      brand: 'Constantin Brâncuși',
      model: 'Măiastra - Replică Autorizată',
      year: 1995,
      location: 'Cluj-Napoca',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Litografie Salvador Dalí - "La Persistance de la Mémoire"',
      description: 'Litografie originală Salvador Dalí din 1974, "La Persistance de la Mémoire". Ediție limitată 150/300, semnată în creion de artist. Dimensiuni 70x50cm, înrămată profesional. Certificat de la Dalí Foundation. Stare de conservare perfectă, păstrată departe de lumină.',
      category: 'Artă',
      price: 18000,
      currency: 'EUR',
      condition: 'Perfectă',
      brand: 'Salvador Dalí',
      model: 'La Persistance de la Mémoire',
      year: 1974,
      location: 'Timișoara',
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Fotografie de Artă - Helmut Newton "Big Nudes"',
      description: 'Fotografie originală Helmut Newton din seria "Big Nudes", 1980. Print gelatin silver, 50x60cm. Semnată pe verso de fotograf. Provenință: Galerie Gmurzynska, Zürich. Una dintre cele mai iconice serii ale marelui fotograf. Investiție sigură în fotografia de artă.',
      category: 'Artă',
      price: 12000,
      currency: 'EUR',
      condition: 'Excelentă',
      brand: 'Helmut Newton',
      model: 'Big Nudes Series',
      year: 1980,
      location: 'Brașov',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
      ]
    },
    {
      title: 'Ceramică Arta Contemporană - Grayson Perry "Essex House"',
      description: 'Vas ceramic Grayson Perry "Essex House" din 2017. Înălțime 35cm, glazură colorată cu motivele caracteristice artistului. Piesă unică, nu replică. Turner Prize winner, artist britanic de renume mondial. Achiziționat direct de la White Cube Gallery, Londra.',
      category: 'Artă',
      price: 22000,
      currency: 'EUR',
      condition: 'Ca nou',
      brand: 'Grayson Perry',
      model: 'Essex House Ceramic',
      year: 2017,
      location: 'Sibiu',
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      ]
    }
  ];

  for (const opera of arta) {
    await prisma.listing.create({
      data: { ...opera, userId: testUser.id }
    });
  }
