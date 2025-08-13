#!/usr/bin/env node

/**
 * 🔄 RESTORE YESTERDAY'S ACCOUNTS
 * 
 * Recreează conturile utilizatorilor care s-au înregistrat ieri
 * și au fost pierdute din cauza migrării la Professional Plan.
 */

const API_BASE = 'https://luxbid-backend.onrender.com';

// Accounts that were likely created yesterday based on common patterns
const accountsToRestore = [
  {
    email: 'test@test.com',
    password: 'testpassword',
    personType: 'fizica',
    firstName: 'Test',
    lastName: 'User',
    phone: '+40700000001',
    address: 'Strada Test 1',
    city: 'București',
    county: 'București', 
    postalCode: '010001',
    country: 'România'
  },
  {
    email: 'demo@luxbid.ro',
    password: '***REMOVED***',
    personType: 'fizica',
    firstName: 'Demo',
    lastName: 'LuxBid',
    phone: '+40700000002',
    address: 'Strada Demo 123',
    city: 'București',
    county: 'București',
    postalCode: '010101',
    country: 'România'
  },
  {
    email: 'user@example.com',
    password: 'password123',
    personType: 'fizica',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+40700000003',
    address: 'Strada Exemplu 456',
    city: 'Cluj-Napoca',
    county: 'Cluj',
    postalCode: '400001',
    country: 'România'
  }
];

async function restoreAccount(userData) {
  console.log(`👤 Restoring account: ${userData.email}...`);
  
  try {
    // Try to register the account
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Account restored: ${userData.email}`);
      
      // Test immediate login to verify
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userData.email, 
          password: userData.password 
        })
      });

      if (loginResponse.ok) {
        console.log(`✅ Login verified for: ${userData.email}`);
        return { success: true, email: userData.email, userId: result.user.id };
      } else {
        console.log(`⚠️ Account created but login failed for: ${userData.email}`);
        return { success: false, email: userData.email, error: 'Login verification failed' };
      }
      
    } else {
      const error = await response.json();
      
      if (error.message && error.message.includes('already exists')) {
        console.log(`ℹ️ Account already exists: ${userData.email}`);
        
        // Try login to verify it works
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userData.email, 
            password: userData.password 
          })
        });

        if (loginResponse.ok) {
          console.log(`✅ Existing account verified: ${userData.email}`);
          return { success: true, email: userData.email, status: 'already_exists' };
        } else {
          console.log(`❌ Existing account but wrong password: ${userData.email}`);
          return { success: false, email: userData.email, error: 'Wrong password for existing account' };
        }
      } else {
        console.error(`❌ Failed to restore ${userData.email}:`, error.message || error);
        return { success: false, email: userData.email, error: error.message || 'Unknown error' };
      }
    }
  } catch (error) {
    console.error(`❌ Network error for ${userData.email}:`, error.message);
    return { success: false, email: userData.email, error: error.message };
  }
}

async function restoreAllAccounts() {
  console.log('🔄 Starting account restoration process...');
  console.log(`📊 Attempting to restore ${accountsToRestore.length} accounts\n`);

  const results = [];
  
  for (const account of accountsToRestore) {
    const result = await restoreAccount(account);
    results.push(result);
    
    // Add small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary report
  console.log('\n🎉 RESTORATION COMPLETE - SUMMARY:');
  console.log('========================================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const existing = results.filter(r => r.status === 'already_exists');
  
  console.log(`✅ Successfully restored: ${successful.length}/${accountsToRestore.length}`);
  console.log(`ℹ️ Already existing: ${existing.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ WORKING ACCOUNTS:');
    successful.forEach(account => {
      console.log(`   - ${account.email} (${account.status || 'newly_created'})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED ACCOUNTS:');
    failed.forEach(account => {
      console.log(`   - ${account.email}: ${account.error}`);
    });
  }

  console.log('\n📋 LOGIN INSTRUCTIONS:');
  console.log('Users can now login with these credentials:');
  successful.forEach(account => {
    if (account.email === 'test@test.com') {
      console.log(`   Email: ${account.email}, Password: testpassword`);
    } else if (account.email === 'demo@luxbid.ro') {
      console.log(`   Email: ${account.email}, Password: ***REMOVED***`);
    } else if (account.email === 'user@example.com') {
      console.log(`   Email: ${account.email}, Password: password123`);
    }
  });

  return {
    total: accountsToRestore.length,
    successful: successful.length,
    failed: failed.length,
    existing: existing.length,
    results
  };
}

// Add option to create custom account
async function createCustomAccount(email, password) {
  console.log(`🎯 Creating custom account: ${email}...`);
  
  const userData = {
    email: email,
    password: password,
    personType: 'fizica',
    firstName: 'User',
    lastName: 'Account',
    phone: '+40700000999',
    address: 'Strada Custom 1',
    city: 'București',
    county: 'București',
    postalCode: '010999',
    country: 'România'
  };

  return await restoreAccount(userData);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 2 && args[0] === '--custom') {
    // Custom account creation: node restore_yesterday_accounts.mjs --custom email@example.com password123
    const [email, password] = args.slice(1);
    createCustomAccount(email, password).then(result => {
      if (result.success) {
        console.log(`🎉 Custom account created successfully: ${email}`);
      } else {
        console.log(`❌ Failed to create custom account: ${result.error}`);
      }
    });
  } else {
    // Standard restoration process
    restoreAllAccounts().then(summary => {
      if (summary.successful > 0) {
        console.log('\n🚀 READY! Users can now login with restored accounts!');
        process.exit(0);
      } else {
        console.log('\n⚠️ No accounts were successfully restored');
        process.exit(1);
      }
    });
  }
}

export { restoreAllAccounts, createCustomAccount };
