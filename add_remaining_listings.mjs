import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addRemainingListings() {
  console.log('🚀 Adding remaining listings (Bijuterii + Artă)...');

  const testUser = await prisma.user.findUnique({
    where: { email: 'demo@luxbid.ro' }
  });

  if (!testUser) {
    console.error('Demo user not found!');
    return;
  }

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
  console.log('✅ Created 5 Bijuterii listings');

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
      title: 'Ceramică Artă Contemporană - Grayson Perry "Essex House"',
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
  console.log('✅ Created 5 Artă listings');

  console.log('🎉 All 20 sample listings created successfully!');
}

addRemainingListings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
