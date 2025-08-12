import { PrismaClient } from '@prisma/client';

// Use environment variable or fallback to Render URL
const databaseUrl = process.env.DATABASE_URL || '***REMOVED***';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

async function restoreSampleListings() {
  try {
    console.log('🔄 Restaurez anunțurile pierdute cu imagini Cloudinary...');

    // Create a demo user first
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@luxbid.ro' },
      update: {},
      create: {
        email: 'demo@luxbid.ro',
        password: '$2b$10$dummy.hashed.password.for.demo.user.only',
        personType: 'FIZICA',
        firstName: 'Demo',
        lastName: 'User',
        phone: '+40700000000',
        address: 'Strada Demo 123',
        city: 'București',
        county: 'București',
        postalCode: '010101',
        country: 'România'
      }
    });

    console.log('👤 Demo user created:', demoUser.email);

    // Sample listings with Cloudinary placeholder images
    const sampleListings = [
      {
        title: 'Rolex Submariner 2023',
        description: 'Ceas de lux Rolex Submariner, model 2023, în stare perfectă. Vine cu cutie originală și certificat de autenticitate. Prețul este ferm.',
        category: 'Ceasuri',
        price: 45000,
        currency: 'EUR',
        condition: 'Nou',
        brand: 'Rolex',
        model: 'Submariner',
        year: 2023,
        location: 'București',
        images: [
          'https://res.cloudinary.com/demo/image/upload/v1647875123/sample-watches/rolex-submariner-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1647875124/sample-watches/rolex-submariner-2.jpg'
        ],
        userId: demoUser.id
      },
      {
        title: 'Hermès Birkin Bag',
        description: 'Geantă Hermès Birkin din piele autentică, culoare negru, mărimea 35cm. Un investiție în stil și eleganță. Vine cu cutie și certificat de autenticitate.',
        category: 'Genți',
        price: 25000,
        currency: 'EUR',
        condition: 'Foarte bună',
        brand: 'Hermès',
        model: 'Birkin',
        year: 2022,
        location: 'Cluj-Napoca',
        images: [
          'https://res.cloudinary.com/demo/image/upload/v1647875125/sample-bags/hermes-birkin-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1647875126/sample-bags/hermes-birkin-2.jpg'
        ],
        userId: demoUser.id
      },
      {
        title: 'Inel cu Diamant Tiffany & Co',
        description: 'Inel de logodnă Tiffany & Co cu diamant de 2 carate, aur alb 18k. Certificat GIA inclus. Piesa perfectă pentru momentele speciale.',
        category: 'Bijuterii',
        price: 15000,
        currency: 'EUR',
        condition: 'Nou',
        brand: 'Tiffany & Co',
        model: 'Engagement Ring',
        year: 2023,
        location: 'Timișoara',
        images: [
          'https://res.cloudinary.com/demo/image/upload/v1647875127/sample-jewelry/tiffany-ring-1.jpg',
          'https://res.cloudinary.com/demo/image/upload/v1647875128/sample-jewelry/tiffany-ring-2.jpg'
        ],
        userId: demoUser.id
      }
    ];

    // Insert sample listings
    for (const listing of sampleListings) {
      const created = await prisma.listing.create({
        data: listing
      });
      console.log(`✅ Created listing: ${created.title}`);
    }

    console.log('🎉 Sample listings restored successfully!');
    console.log('📊 Total listings in database:', await prisma.listing.count());

  } catch (error) {
    console.error('❌ Error restoring sample listings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreSampleListings();
