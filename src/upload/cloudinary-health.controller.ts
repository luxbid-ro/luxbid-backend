import { Controller, Get } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Controller('health')
export class CloudinaryHealthController {
  
  @Get('cloudinary')
  async checkCloudinary() {
    try {
      // Test Cloudinary configuration
      const config = cloudinary.config();
      
      if (!config.cloud_name || !config.api_key || !config.api_secret) {
        return {
          status: 'error',
          message: 'Cloudinary not properly configured',
          configured: false
        };
      }

      // Test Cloudinary connectivity by getting account details
      const resources = await cloudinary.api.resources({
        resource_type: 'image',
        prefix: 'luxbid/',
        max_results: 5
      });

      return {
        status: 'success',
        message: 'Cloudinary is working properly',
        configured: true,
        cloud_name: config.cloud_name,
        total_resources: resources.resources.length,
        recent_uploads: resources.resources.map(r => ({
          public_id: r.public_id,
          url: r.secure_url,
          created_at: r.created_at
        }))
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Cloudinary error: ${error.message}`,
        configured: false
      };
    }
  }

  @Get('images-sync')
  async checkImageSync() {
    try {
      // This would check if all listings have valid image URLs
      // For now, return basic info
      return {
        status: 'info',
        message: 'Image sync check - all new uploads go to Cloudinary',
        recommendation: 'All new images are stored permanently in Cloudinary',
        permanent_storage: true,
        backup_needed: false
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Sync check error: ${error.message}`
      };
    }
  }
}
