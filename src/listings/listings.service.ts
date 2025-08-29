import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async getAllListings(category?: string, searchQuery?: string) {
    let whereClause: any = {
      status: 'ACTIVE',
    };

    if (category) {
      whereClause.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (searchQuery) {
      whereClause.OR = [
        {
          title: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    const listings = await this.prisma.listing.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map to include desiredPrice for frontend compatibility
    return listings.map((l: any) => ({ ...l, desiredPrice: l.price }));
  }

  async createListing(createListingDto: any) {
    const created = await this.prisma.listing.create({
      data: {
        title: createListingDto.title,
        description: createListingDto.description,
        category: createListingDto.category,
        price: createListingDto.desiredPrice ?? createListingDto.price ?? 0,
        currency: createListingDto.currency || 'RON',
        condition: createListingDto.condition || 'Excelentă',
        brand: createListingDto.brand || 'N/A',
        model: createListingDto.model || 'N/A',
        year: createListingDto.year || new Date().getFullYear(),
        location: createListingDto.location || 'București',
        status: 'ACTIVE',
        userId: createListingDto.userId,
        images: createListingDto.images || [],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });
    return { ...created, desiredPrice: created.price };
  }

  async getListingById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });
    return listing ? { ...listing, desiredPrice: (listing as any).price, sellerId: (listing as any).userId } : null;
  }

  async getMyListings(userId: string) {
    console.log('📋 GET MY LISTINGS for user:', userId);
    
    const listings = await this.prisma.listing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log('📊 Found listings for user:', listings.map(l => ({ 
      id: l.id, 
      title: l.title, 
      userId: l.userId,
      createdAt: l.createdAt 
    })));
    
    return listings.map((l: any) => ({ ...l, desiredPrice: l.price }));
  }

  async updateListing(id: string, ownerId: string, updateDto: any) {
    // Ensure ownership
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.userId !== ownerId) {
      throw new (require('@nestjs/common').ForbiddenException)('Nu ai permisiunea');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        title: updateDto.title,
        description: updateDto.description,
        category: updateDto.category,
        brand: updateDto.brand || listing.brand,
        model: updateDto.model || listing.model,
        year: updateDto.year || listing.year,
        condition: updateDto.condition || listing.condition,
        location: updateDto.location || listing.location,
        price: updateDto.desiredPrice ?? updateDto.price ?? listing.price,
        currency: updateDto.currency || listing.currency,
      },
    });
    return { ...updated, desiredPrice: updated.price };
  }

  async deleteListing(id: string, ownerId: string) {
    console.log('🗑️ DELETE REQUEST START:', { id, ownerId });
    
    // Ensure ownership
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    console.log('📋 Found listing:', listing ? { id: listing.id, userId: listing.userId, title: listing.title } : 'NULL');
    
    if (!listing) {
      console.log('❌ Listing not found');
      throw new (require('@nestjs/common').NotFoundException)('Anunțul nu a fost găsit');
    }
    if (listing.userId !== ownerId) {
      console.log('❌ Ownership mismatch:', { listingUserId: listing.userId, requestOwnerId: ownerId });
      throw new (require('@nestjs/common').ForbiddenException)('Nu ai permisiunea să ștergi acest anunț');
    }

    console.log('✅ Ownership verified, attempting delete...');

    try {
      // Delete the listing
      const deleteResult = await this.prisma.listing.delete({
        where: { id },
      });
      console.log('✅ DELETE SUCCESSFUL:', deleteResult);
      
      // Verify deletion
      const verifyDeleted = await this.prisma.listing.findUnique({ where: { id } });
      console.log('🔍 Verification check:', verifyDeleted ? 'STILL EXISTS!' : 'CONFIRMED DELETED');
      
      return { 
        message: 'Anunțul a fost șters cu succes',
        deletedId: id,
        verified: !verifyDeleted
      };
    } catch (error) {
      console.error('❌ DELETE FAILED:', error);
      throw error;
    }
  }
}
