import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

/**
 * 🔒 CLOUDINARY AS SECURE DATABASE
 * 
 * Uses Cloudinary's metadata and context features to store user data.
 * This is more reliable than Render's PostgreSQL for persistence.
 */

@Injectable()
export class CloudinaryDbService {
  
  constructor() {
    // Cloudinary is already configured in upload.service.ts
  }

  /**
   * Save user data to Cloudinary as a JSON "image"
   */
  async saveUser(userData: any): Promise<string> {
    try {
      console.log('💾 Saving user to Cloudinary database...');
      
      // Create a unique identifier for the user
      const userId = userData.email.replace(/[@.]/g, '_');
      const timestamp = new Date().toISOString();
      
      // Create a small image with user data as metadata
      const userDataString = JSON.stringify({
        ...userData,
        savedAt: timestamp,
        type: 'user_account'
      });
      
      // Upload a tiny transparent pixel with user data in context
      const result = await cloudinary.uploader.upload(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        {
          public_id: `luxbid_users/${userId}`,
          context: {
            user_data: userDataString,
            email: userData.email,
            type: 'user_account',
            created_at: timestamp
          },
          tags: ['luxbid', 'user', 'database'],
          resource_type: 'image',
          overwrite: true // Always update existing
        }
      );
      
      console.log(`✅ User saved to Cloudinary: ${userData.email}`);
      return result.public_id;
      
    } catch (error) {
      console.error('❌ Failed to save user to Cloudinary:', error.message);
      throw error;
    }
  }

  /**
   * Load user data from Cloudinary
   */
  async loadUser(email: string): Promise<any | null> {
    try {
      console.log(`🔍 Loading user from Cloudinary: ${email}`);
      
      const userId = email.replace(/[@.]/g, '_');
      const publicId = `luxbid_users/${userId}`;
      
      // Get resource info including context
      const result = await cloudinary.api.resource(publicId, {
        context: true
      });
      
      if (result && result.context && result.context.user_data) {
        const userData = JSON.parse(result.context.user_data);
        console.log(`✅ User loaded from Cloudinary: ${email}`);
        return userData;
      }
      
      console.log(`ℹ️ User not found in Cloudinary: ${email}`);
      return null;
      
    } catch (error) {
      if (error.http_code === 404) {
        console.log(`ℹ️ User not found in Cloudinary: ${email}`);
        return null;
      }
      
      console.error('❌ Failed to load user from Cloudinary:', error.message);
      throw error;
    }
  }

  /**
   * List all users from Cloudinary
   */
  async getAllUsers(): Promise<any[]> {
    try {
      console.log('📊 Loading all users from Cloudinary...');
      
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'luxbid_users/',
        context: true,
        max_results: 500
      });
      
      const users = result.resources
        .filter(resource => resource.context && resource.context.user_data)
        .map(resource => {
          try {
            return JSON.parse(resource.context.user_data);
          } catch (e) {
            console.warn('⚠️ Failed to parse user data:', resource.public_id);
            return null;
          }
        })
        .filter(user => user !== null);
      
      console.log(`✅ Loaded ${users.length} users from Cloudinary`);
      return users;
      
    } catch (error) {
      console.error('❌ Failed to load users from Cloudinary:', error.message);
      return [];
    }
  }

  /**
   * Delete user from Cloudinary
   */
  async deleteUser(email: string): Promise<boolean> {
    try {
      const userId = email.replace(/[@.]/g, '_');
      const publicId = `luxbid_users/${userId}`;
      
      await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️ User deleted from Cloudinary: ${email}`);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to delete user from Cloudinary:', error.message);
      return false;
    }
  }

  /**
   * Check if Cloudinary database is healthy
   */
  async checkHealth(): Promise<{ status: string; userCount: number }> {
    try {
      const users = await this.getAllUsers();
      return {
        status: 'healthy',
        userCount: users.length
      };
    } catch (error) {
      return {
        status: 'error',
        userCount: 0
      };
    }
  }

  /**
   * Sync user from Cloudinary to local database (if needed)
   */
  async syncUserToLocal(email: string, prismaService: any): Promise<boolean> {
    try {
      const cloudinaryUser = await this.loadUser(email);
      
      if (!cloudinaryUser) {
        console.log(`ℹ️ User not found in Cloudinary: ${email}`);
        return false;
      }
      
      // Check if user exists in local DB
      const existingUser = await prismaService.user.findUnique({
        where: { email: email }
      });
      
      if (existingUser) {
        console.log(`ℹ️ User already exists in local DB: ${email}`);
        return true;
      }
      
      // Create user in local DB from Cloudinary data
      const newUser = await prismaService.user.create({
        data: {
          email: cloudinaryUser.email,
          password: cloudinaryUser.password,
          personType: cloudinaryUser.personType,
          firstName: cloudinaryUser.firstName || 'Unknown',
          lastName: cloudinaryUser.lastName || 'User',
          phone: cloudinaryUser.phone || '+40700000000',
          address: cloudinaryUser.address || 'Unknown Address',
          city: cloudinaryUser.city || 'București',
          county: cloudinaryUser.county || 'București',
          postalCode: cloudinaryUser.postalCode || '010001',
          country: cloudinaryUser.country || 'România',
          isVerified: cloudinaryUser.isVerified || false,
          isAdmin: cloudinaryUser.isAdmin || false
        }
      });
      
      console.log(`✅ User synced from Cloudinary to local DB: ${email}`);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to sync user from Cloudinary:', error.message);
      return false;
    }
  }

  /**
   * Emergency restore all users from Cloudinary to local DB
   */
  async emergencyRestoreFromCloudinary(prismaService: any): Promise<number> {
    try {
      console.log('🚨 EMERGENCY: Restoring all users from Cloudinary...');
      
      const cloudinaryUsers = await this.getAllUsers();
      let restoredCount = 0;
      
      for (const userData of cloudinaryUsers) {
        try {
          // Check if user already exists
          const existingUser = await prismaService.user.findUnique({
            where: { email: userData.email }
          });
          
          if (existingUser) {
            console.log(`ℹ️ User already exists: ${userData.email}`);
            continue;
          }
          
          // Create user from Cloudinary data
          await prismaService.user.create({
            data: {
              email: userData.email,
              password: userData.password,
              personType: userData.personType,
              firstName: userData.firstName || 'Restored',
              lastName: userData.lastName || 'User',
              phone: userData.phone || '+40700000000',
              address: userData.address || 'Restored Address',
              city: userData.city || 'București',
              county: userData.county || 'București',
              postalCode: userData.postalCode || '010001',
              country: userData.country || 'România',
              isVerified: userData.isVerified || false,
              isAdmin: userData.isAdmin || false
            }
          });
          
          restoredCount++;
          console.log(`✅ Restored user: ${userData.email}`);
          
        } catch (userError) {
          console.error(`❌ Failed to restore user ${userData.email}:`, userError.message);
        }
      }
      
      console.log(`🎉 Emergency restore complete: ${restoredCount}/${cloudinaryUsers.length} users restored`);
      return restoredCount;
      
    } catch (error) {
      console.error('❌ Emergency restore failed:', error.message);
      return 0;
    }
  }
}
