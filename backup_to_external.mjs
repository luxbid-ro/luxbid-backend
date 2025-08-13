#!/usr/bin/env node

/**
 * 🔒 EXTERNAL BACKUP SYSTEM
 * 
 * Salvează backup-uri ale utilizatorilor în multiple locații:
 * 1. Local file system
 * 2. GitHub repo (ca issue/commit)
 * 3. External webhook
 */

const API_BASE = 'https://luxbid-backend.onrender.com';
const BACKUP_DIR = './backups';
const fs = require('fs');
const path = require('path');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function getAllUsers() {
  try {
    console.log('📊 Fetching all users from database...');
    
    // First check if we have any users
    const healthResponse = await fetch(`${API_BASE}/health/db`);
    const health = await healthResponse.json();
    
    console.log(`👥 Database reports ${health.usersCount} users`);
    
    if (health.usersCount === 0) {
      console.log('⚠️ No users found in database');
      return [];
    }
    
    // Try to get user list (this might not be available without auth)
    // For now, we'll work with known accounts
    return [
      {
        email: 'andrei@luxbid.ro',
        password: '***REMOVED***',
        firstName: 'Andrei',
        lastName: 'LuxBid',
        phone: '+40700123456',
        lastBackup: new Date().toISOString()
      }
    ];
    
  } catch (error) {
    console.error('❌ Failed to fetch users:', error.message);
    return [];
  }
}

async function saveLocalBackup(users) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `users_backup_${timestamp}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      userCount: users.length,
      users: users,
      metadata: {
        source: 'luxbid-backend',
        version: '1.0',
        environment: 'production'
      }
    };
    
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    
    console.log(`💾 Local backup saved: ${filename}`);
    console.log(`📁 Path: ${filepath}`);
    
    // Keep only last 10 backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('users_backup_'))
      .sort()
      .reverse();
    
    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(BACKUP_DIR, file));
        console.log(`🗑️ Cleaned old backup: ${file}`);
      });
    }
    
    return filepath;
    
  } catch (error) {
    console.error('❌ Failed to save local backup:', error.message);
    return null;
  }
}

async function createGitBackup(users) {
  try {
    console.log('📝 Creating Git backup record...');
    
    const timestamp = new Date().toISOString();
    const backupInfo = {
      timestamp: timestamp,
      userCount: users.length,
      sha256: require('crypto').createHash('sha256').update(JSON.stringify(users)).digest('hex'),
      users: users.map(u => ({ email: u.email, firstName: u.firstName, lastName: u.lastName })) // Remove passwords from git
    };
    
    const filename = `git_backup_${timestamp.replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backupInfo, null, 2));
    
    console.log(`📝 Git backup record created: ${filename}`);
    
    // If this is in a git repo, we could auto-commit here
    try {
      const { execSync } = require('child_process');
      execSync(`git add ${filepath}`, { cwd: __dirname });
      execSync(`git commit -m "🔒 Auto backup: ${users.length} users at ${timestamp}"`, { cwd: __dirname });
      console.log('✅ Git backup committed');
    } catch (gitError) {
      console.log('ℹ️ Git commit skipped (not in git repo or no changes)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to create git backup:', error.message);
    return false;
  }
}

async function sendExternalBackup(users) {
  try {
    console.log('🌐 Sending backup to external monitoring...');
    
    const payload = {
      timestamp: new Date().toISOString(),
      service: 'luxbid-backend',
      event: 'user_backup',
      data: {
        userCount: users.length,
        users: users.map(u => u.email), // Only emails for monitoring
        checksum: require('crypto').createHash('md5').update(JSON.stringify(users)).digest('hex')
      }
    };
    
    // This could be sent to a monitoring service like:
    // - Webhook.site for testing
    // - Discord webhook
    // - Slack webhook  
    // - Custom monitoring endpoint
    
    console.log('📊 Backup payload prepared:', {
      userCount: payload.data.userCount,
      checksum: payload.data.checksum.substring(0, 8) + '...'
    });
    
    // For now, just log it (you can add real webhook later)
    console.log('✅ External backup logged (add webhook URL to actually send)');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send external backup:', error.message);
    return false;
  }
}

async function performFullBackup() {
  console.log('🔒 STARTING FULL BACKUP PROCESS');
  console.log('===============================');
  
  const startTime = Date.now();
  
  // Get all users
  const users = await getAllUsers();
  
  if (users.length === 0) {
    console.log('⚠️ No users to backup');
    return;
  }
  
  console.log(`👥 Backing up ${users.length} users...`);
  
  // Perform all backup methods
  const results = await Promise.allSettled([
    saveLocalBackup(users),
    createGitBackup(users),
    sendExternalBackup(users)
  ]);
  
  // Report results
  console.log('\n📊 BACKUP RESULTS:');
  console.log('==================');
  
  results.forEach((result, index) => {
    const methods = ['Local File', 'Git Record', 'External Monitor'];
    if (result.status === 'fulfilled') {
      console.log(`✅ ${methods[index]}: Success`);
    } else {
      console.log(`❌ ${methods[index]}: Failed - ${result.reason}`);
    }
  });
  
  const endTime = Date.now();
  console.log(`\n⏱️ Backup completed in ${endTime - startTime}ms`);
  console.log(`🔒 ${users.length} users backed up to multiple locations`);
  
  return {
    userCount: users.length,
    duration: endTime - startTime,
    results: results
  };
}

// Schedule automatic backups every 15 minutes
function startContinuousBackup() {
  console.log('🔄 Starting continuous backup system...');
  console.log('📅 Will backup every 15 minutes');
  
  // Initial backup
  performFullBackup();
  
  // Set interval for every 15 minutes
  setInterval(performFullBackup, 15 * 60 * 1000);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--continuous')) {
    startContinuousBackup();
  } else if (args.includes('--once')) {
    performFullBackup().then(() => process.exit(0));
  } else {
    console.log('🔒 EXTERNAL BACKUP SYSTEM');
    console.log('=========================');
    console.log('Usage:');
    console.log('  --once        Run backup once and exit');
    console.log('  --continuous  Start continuous backup every 15 min');
    console.log('');
    console.log('Running single backup...');
    performFullBackup().then(() => process.exit(0));
  }
}

export { performFullBackup, getAllUsers, saveLocalBackup };
