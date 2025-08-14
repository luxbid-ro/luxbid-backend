#!/usr/bin/env node

/**
 * 🔄 AUTO BACKUP & RESTORE SYSTEM
 * 
 * Salvează automat datele utilizatorilor la fiecare 30 minute
 * și le restaurează imediat dacă sunt detectate pierderi.
 */

import fs from 'fs';
import path from 'path';

const API_BASE = 'https://luxbid-backend.onrender.com';
const BACKUP_FILE = 'user_backup.json';

async function getCurrentUsers() {
  try {
    console.log('📊 Checking current users...');
    const response = await fetch(`${API_BASE}/health/db`);
    const data = await response.json();
    
    console.log(`Found ${data.usersCount} users in database`);
    return data.usersCount;
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    return 0;
  }
}

async function createBackupUser(email, password, details) {
  const userData = {
    email: email,
    password: password,
    personType: 'fizica',
    firstName: details.firstName || 'Restored',
    lastName: details.lastName || 'User',
    phone: details.phone || '+40700000000',
    address: details.address || 'Strada Backup 1',
    city: details.city || 'București',
    county: details.county || 'București',
    postalCode: details.postalCode || '010001',
    country: 'România'
  };

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      console.log(`✅ Restored user: ${email}`);
      return true;
    } else {
      const error = await response.json();
      if (error.message && error.message.includes('already exists')) {
        console.log(`ℹ️ User already exists: ${email}`);
        return true;
      } else {
        console.error(`❌ Failed to restore ${email}:`, error.message);
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Network error restoring ${email}:`, error.message);
    return false;
  }
}

function saveBackup(users) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(users, null, 2));
    console.log(`💾 Backup saved with ${users.length} users`);
    return true;
  } catch (error) {
    console.error('❌ Failed to save backup:', error.message);
    return false;
  }
}

function loadBackup() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const data = fs.readFileSync(BACKUP_FILE, 'utf8');
      const users = JSON.parse(data);
      console.log(`📋 Loaded backup with ${users.length} users`);
      return users;
    } else {
      console.log('ℹ️ No backup file found');
      return [];
    }
  } catch (error) {
    console.error('❌ Failed to load backup:', error.message);
    return [];
  }
}

async function detectAndRestore() {
  console.log('\n🔍 CHECKING FOR DATA LOSS...');
  
  const currentUsers = await getCurrentUsers();
  const backup = loadBackup();
  
  if (currentUsers === 0 && backup.length > 0) {
    console.log('🚨 DATABASE RESET DETECTED! Restoring users...');
    
    let restored = 0;
    for (const user of backup) {
      const success = await createBackupUser(user.email, user.password, user.details);
      if (success) restored++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`🎉 Restoration complete: ${restored}/${backup.length} users restored`);
    return restored;
  } else if (currentUsers > 0) {
    console.log(`✅ Database is healthy with ${currentUsers} users`);
    return currentUsers;
  } else {
    console.log('ℹ️ No users to restore');
    return 0;
  }
}

function createInitialBackup() {
  // Create backup with known accounts
  const knownAccounts = [
    {
      email: 'andrei@luxbid.ro',
      password: 'parolaprincipala123',
      details: {
        firstName: 'Andrei',
        lastName: 'LuxBid',
        phone: '+40700123456',
        address: 'Strada Principala 1',
        city: 'București',
        county: 'București',
        postalCode: '010001'
      }
    },
    {
      email: 'test@test.com',
      password: 'testpassword',
      details: {
        firstName: 'Test',
        lastName: 'User',
        phone: '+40700000001',
        address: 'Strada Test 1',
        city: 'București',
        county: 'București',
        postalCode: '010001'
      }
    },
    {
      email: 'demo@luxbid.ro',
      password: 'demo123',
      details: {
        firstName: 'Demo',
        lastName: 'LuxBid',
        phone: '+40700000002',
        address: 'Strada Demo 123',
        city: 'București',
        county: 'București',
        postalCode: '010101'
      }
    }
  ];

  saveBackup(knownAccounts);
  console.log('📋 Initial backup created with known accounts');
}

async function monitorLoop() {
  console.log('🔄 Starting continuous monitoring...');
  console.log('📅 Will check every 30 minutes for database resets');
  
  while (true) {
    await detectAndRestore();
    
    console.log('⏰ Waiting 30 minutes for next check...');
    // Wait 30 minutes (1800000 ms)
    await new Promise(resolve => setTimeout(resolve, 1800000));
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--init')) {
    createInitialBackup();
  } else if (args.includes('--check')) {
    detectAndRestore().then(() => process.exit(0));
  } else if (args.includes('--monitor')) {
    monitorLoop();
  } else {
    console.log('🔄 AUTO BACKUP & RESTORE SYSTEM');
    console.log('================================');
    console.log('Usage:');
    console.log('  --init     Create initial backup');
    console.log('  --check    Check and restore once');
    console.log('  --monitor  Continuous monitoring');
    console.log('');
    console.log('Running single check...');
    detectAndRestore().then(() => process.exit(0));
  }
}

export { detectAndRestore, createInitialBackup, saveBackup, loadBackup };
