#!/usr/bin/env node

/**
 * 🔄 BACKUP SCRIPT - Înainte de Render Paid Upgrade
 * 
 * Acest script salvează toate datele din database înainte de upgrade
 * pentru a ne asigura că nu pierdem nimic în timpul tranziției.
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function createBackup() {
  try {
    console.log('🔄 Starting database backup...');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    
    // Backup all users
    console.log('👥 Backing up users...');
    const users = await prisma.user.findMany({
      include: {
        listings: {
          include: {
            offers: {
              include: {
                messages: true
              }
            }
          }
        },
        offers: true,
        sentMessages: true,
        receivedMessages: true
      }
    });
    
    // Backup all listings
    console.log('📦 Backing up listings...');
    const listings = await prisma.listing.findMany({
      include: {
        user: true,
        offers: {
          include: {
            user: true,
            messages: true
          }
        }
      }
    });
    
    // Backup all offers
    console.log('💰 Backing up offers...');
    const offers = await prisma.offer.findMany({
      include: {
        user: true,
        listing: true,
        messages: true
      }
    });
    
    // Backup all messages
    console.log('💬 Backing up messages...');
    const messages = await prisma.message.findMany({
      include: {
        sender: true,
        receiver: true,
        offer: true
      }
    });
    
    // Create comprehensive backup object
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        description: 'Pre-Render-Paid-Upgrade Backup',
        totalUsers: users.length,
        totalListings: listings.length,
        totalOffers: offers.length,
        totalMessages: messages.length
      },
      data: {
        users,
        listings,
        offers,
        messages
      }
    };
    
    // Save to file
    const filename = `luxbid_backup_${timestamp}.json`;
    writeFileSync(filename, JSON.stringify(backup, null, 2));
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 File saved: ${filename}`);
    console.log(`📊 Statistics:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Listings: ${listings.length}`);
    console.log(`   - Offers: ${offers.length}`);
    console.log(`   - Messages: ${messages.length}`);
    
    // Create SQL dump as well
    console.log('💾 Creating SQL backup...');
    const sqlFilename = `luxbid_backup_${timestamp}.sql`;
    console.log(`📝 SQL backup recommended via manual pg_dump:`);
    console.log(`   pg_dump $DATABASE_URL > ${sqlFilename}`);
    
    return { success: true, filename, stats: backup.metadata };
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createBackup().then(result => {
    if (result.success) {
      console.log('🎉 Ready for Render Paid upgrade!');
      process.exit(0);
    } else {
      console.error('🚨 Backup failed - DO NOT upgrade yet!');
      process.exit(1);
    }
  });
}

export default createBackup;
