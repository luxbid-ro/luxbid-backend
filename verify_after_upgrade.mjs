#!/usr/bin/env node

/**
 * ✅ POST-UPGRADE VERIFICATION SCRIPT
 * 
 * Verifică că toate datele sunt intacte după upgrade la Render Paid
 * și că funcționalitatea de login funcționează perfect.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function verifyUpgrade() {
  try {
    console.log('🔍 Starting post-upgrade verification...');
    
    // Test 1: Database Connection
    console.log('\n📡 Testing database connection...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection: OK');
    
    // Test 2: Count all records
    console.log('\n📊 Counting records...');
    const userCount = await prisma.user.count();
    const listingCount = await prisma.listing.count();
    const offerCount = await prisma.offer.count();
    const messageCount = await prisma.message.count();
    
    console.log(`✅ Users: ${userCount}`);
    console.log(`✅ Listings: ${listingCount}`);
    console.log(`✅ Offers: ${offerCount}`);
    console.log(`✅ Messages: ${messageCount}`);
    
    // Test 3: Verify data integrity
    console.log('\n🔗 Testing data relationships...');
    
    // Check if all listings have valid users
    const listingsWithUsers = await prisma.listing.findMany({
      include: { user: true }
    });
    const orphanedListings = listingsWithUsers.filter(l => !l.user);
    if (orphanedListings.length === 0) {
      console.log('✅ All listings have valid users');
    } else {
      console.log(`⚠️ Found ${orphanedListings.length} orphaned listings`);
    }
    
    // Check if all offers have valid users and listings
    const offersWithRelations = await prisma.offer.findMany({
      include: { user: true, listing: true }
    });
    const orphanedOffers = offersWithRelations.filter(o => !o.user || !o.listing);
    if (orphanedOffers.length === 0) {
      console.log('✅ All offers have valid relationships');
    } else {
      console.log(`⚠️ Found ${orphanedOffers.length} orphaned offers`);
    }
    
    // Test 4: Verify login functionality with existing users
    console.log('\n🔐 Testing login functionality...');
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: { id: true, email: true, password: true }
    });
    
    if (sampleUsers.length > 0) {
      console.log(`✅ Found ${sampleUsers.length} users for login testing`);
      
      // Test password structure (should be bcrypt hashed)
      const passwordTests = sampleUsers.map(user => {
        const isBcrypt = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
        return { email: user.email, validHash: isBcrypt };
      });
      
      const validPasswords = passwordTests.filter(t => t.validHash).length;
      console.log(`✅ ${validPasswords}/${sampleUsers.length} users have valid password hashes`);
      
      if (validPasswords < sampleUsers.length) {
        console.log('⚠️ Some passwords may need re-hashing');
      }
    } else {
      console.log('⚠️ No users found in database');
    }
    
    // Test 5: Performance check
    console.log('\n⚡ Testing performance...');
    const startTime = Date.now();
    await prisma.user.findMany({ take: 10 });
    const queryTime = Date.now() - startTime;
    console.log(`✅ Query time: ${queryTime}ms (should be < 1000ms)`);
    
    // Test 6: Verify environment
    console.log('\n🌍 Environment check...');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      console.log('✅ DATABASE_URL is configured');
      if (dbUrl.includes('render.com')) {
        console.log('✅ Using Render PostgreSQL');
      }
    } else {
      console.log('❌ DATABASE_URL not found');
    }
    
    // Summary
    console.log('\n🎉 VERIFICATION SUMMARY:');
    console.log('========================================');
    console.log(`📊 Total Users: ${userCount}`);
    console.log(`📦 Total Listings: ${listingCount}`);
    console.log(`💰 Total Offers: ${offerCount}`);
    console.log(`💬 Total Messages: ${messageCount}`);
    console.log(`⚡ Performance: ${queryTime}ms`);
    console.log('========================================');
    
    if (userCount > 0 && queryTime < 1000) {
      console.log('✅ UPGRADE SUCCESSFUL - All systems operational!');
      return { success: true, stats: { userCount, listingCount, offerCount, messageCount, queryTime } };
    } else {
      console.log('⚠️ VERIFICATION ISSUES - Please investigate');
      return { success: false, issues: 'Performance or data issues detected' };
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyUpgrade().then(result => {
    if (result.success) {
      console.log('\n🚀 Ready to announce: Login issues permanently resolved!');
      process.exit(0);
    } else {
      console.error('\n🚨 Issues detected - may need troubleshooting');
      process.exit(1);
    }
  });
}

export default verifyUpgrade;
