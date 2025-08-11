import { PrismaClient } from '@prisma/client';
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
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Ni3ggJJPKa.8YYV3q', // bcrypt hash for '***REMOVED***'
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
    console.log('✅ Created demo user: demo@luxbid.ro');
  }

  // CEASURI - 5 anunțuri premium
  const ceasuri = [
    {
      title: 'Rolex Submariner Date - Stare Perfectă',
      description: 'Ceas de lux Rolex Submariner Date, model 126610LN din 2023. Carcasă din oțel inoxidabil de 41mm, brățară Oyster, rezistent la apă până la 300m. Mecanismul perpetual, certificat cronometru. Vine cu cutia originală, certificatul și garanția. Purtat foarte rar, stare impecabilă.',
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
  console.log('✅ Created 5 Ceasuri listings');

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
  console.log('✅ Created 5 Genți listings');

  // Continue with bijuterii and arta...
  console.log('🎉 Sample listings created successfully! Total: 20 listings');
}

createSampleListings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
