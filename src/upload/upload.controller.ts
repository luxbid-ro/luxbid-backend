import { Controller, Get, Post, Param, UseGuards, UploadedFiles } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

// Configurare Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurare storage Cloudinary
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'luxbid/listings',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
  } as any,
});

@Controller('upload')
export class UploadController {
  constructor(private prisma: PrismaService) {}
  @Get('images/:listingId')
  getImages(@Param('listingId') listingId: string) {
    // Pentru Cloudinary, returnează lista de imagini din database
    // Acesta este un endpoint de fallback, în realitate imaginile sunt stocate în Cloudinary
    return { message: 'Images are stored in Cloudinary. Check listing data for image URLs.' };
  }

  @Post('images/:listingId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: cloudinaryStorage,
      limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
      fileFilter: (req, file, cb) => {
        if (!/\.(jpe?g|png|webp)$/i.test(file.originalname)) {
          return cb(null, false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImages(@Param('listingId') listingId: string, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      // Cloudinary returnează URL-urile complete în files.path
      const urls = files.map((file: any) => file.path);
      
      // Update listing with new images
      await this.prisma.listing.update({
        where: { id: listingId },
        data: {
          images: {
            push: urls
          }
        }
      });
      
      console.log(`✅ Uploaded ${urls.length} images to Cloudinary for listing ${listingId}`);
      
      return { 
        success: true,
        images: urls,
        message: `Successfully uploaded ${urls.length} image(s) to permanent Cloudinary storage`,
        storage: 'cloudinary',
        permanent: true
      };
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      throw new Error('Failed to upload images to Cloudinary');
    }
  }
}