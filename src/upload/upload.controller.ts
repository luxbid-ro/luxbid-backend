import { Controller, Get, Post, Param, UseGuards, UploadedFiles } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';

function ensureListingDir(listingId: string) {
  const dir = join(process.cwd(), 'uploads', 'listings', listingId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

@Controller('upload')
export class UploadController {
  @Get('images/:listingId')
  getImages(@Param('listingId') listingId: string) {
    const dir = ensureListingDir(listingId);
    const files = readdirSync(dir).map((f) => `/uploads/listings/${listingId}/${f}`);
    return files;
  }

  @Post('images/:listingId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = ensureListingDir(req.params.listingId);
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!/\.(jpe?g|png|webp)$/i.test(file.originalname)) {
          return cb(null, false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImages(@Param('listingId') listingId: string, @UploadedFiles() files: Express.Multer.File[]) {
    const urls = files.map((f) => `/uploads/listings/${listingId}/${f.filename}`);
    return { images: urls };
  }
}


