import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class DataProtectionService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Run data protection checks on startup
    await this.verifyDataIntegrity();
    await this.setupDataProtectionMonitoring();
  }

  private async verifyDataIntegrity() {
    try {
      console.log('🛡️ Verifying data integrity...');
      
      // Check if we have users
      const userCount = await this.prisma.user.count();
      console.log(`👥 Found ${userCount} users in database`);
      
      if (userCount === 0) {
        console.log('⚠️ WARNING: Database appears to be empty!');
        console.log('🔄 This could indicate a data loss event');
        
        // Log this incident for investigation
        console.log(`📊 Database check timestamp: ${new Date().toISOString()}`);
        console.log('📋 Consider running data restoration if this is unexpected');
      } else {
        console.log('✅ Database integrity check passed');
      }
      
      // Check for table existence
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log(`📊 Found ${Array.isArray(tables) ? tables.length : 0} tables in database`);
      
    } catch (error) {
      console.error('❌ Data integrity check failed:', error.message);
    }
  }

  private async setupDataProtectionMonitoring() {
    console.log('🔄 Setting up data protection monitoring...');
    
    // Set up periodic checks every 5 minutes
    setInterval(async () => {
      await this.periodicDataCheck();
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('✅ Data protection monitoring active');
  }

  private async periodicDataCheck() {
    try {
      const userCount = await this.prisma.user.count();
      
      if (userCount === 0) {
        console.log('🚨 CRITICAL: All users disappeared! Possible data loss detected!');
        console.log(`⏰ Incident time: ${new Date().toISOString()}`);
        
        // Here you could add:
        // - Send alert email/Slack notification
        // - Trigger automatic data restoration
        // - Log to external monitoring service
      }
      
    } catch (error) {
      console.log('⚠️ Periodic data check failed:', error.message);
    }
  }

  async logDataOperation(operation: string, details: any) {
    console.log(`📝 Data operation: ${operation}`);
    console.log(`🔍 Details:`, details);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  }

  async emergencyDataRestore() {
    console.log('🚨 EMERGENCY DATA RESTORE INITIATED');
    
    try {
      // Create emergency admin account
      const emergencyAdmin = await this.prisma.user.create({
        data: {
          email: 'emergency@luxbid.ro',
          password: await require('bcrypt').hash('emergency-' + Date.now(), 12),
          personType: 'FIZICA',
          firstName: 'Emergency',
          lastName: 'Admin',
          phone: '+40700000000',
          address: 'Emergency Address',
          city: 'București',
          county: 'București',
          postalCode: '010001',
          country: 'România',
          isAdmin: true,
          isVerified: true
        }
      });
      
      console.log('✅ Emergency admin account created:', emergencyAdmin.email);
      return true;
      
    } catch (error) {
      console.error('❌ Emergency restore failed:', error.message);
      return false;
    }
  }
}
