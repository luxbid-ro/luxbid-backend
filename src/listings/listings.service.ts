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
        hasDocuments: createListingDto.hasDocuments,
        material: createListingDto.material,
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
    const listings = await this.prisma.listing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return listings.map((l: any) => ({ ...l, desiredPrice: l.price }));
  }

  async consolidateUserListings(currentUserId: string) {
    console.log('🔧 CONSOLIDATING LISTINGS for user:', currentUserId);
    
    // Get current user info
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, email: true, createdAt: true }
    });
    
    if (!currentUser) {
      throw new (require('@nestjs/common').NotFoundException)('User not found');
    }
    
    console.log('👤 Current user:', currentUser);
    
    // Find all users with the same email
    const duplicateUsers = await this.prisma.user.findMany({
      where: { 
        email: currentUser.email,
        id: { not: currentUserId }
      },
      select: { id: true, email: true, createdAt: true }
    });
    
    console.log('👥 Found duplicate users:', duplicateUsers);
    
    let transferredCount = 0;
    
    // Transfer listings from duplicate users to current user
    for (const duplicateUser of duplicateUsers) {
      try {
        const result = await this.prisma.listing.updateMany({
          where: { userId: duplicateUser.id },
          data: { userId: currentUserId }
        });
        
        console.log(`📦 Transferred ${result.count} listings from ${duplicateUser.id} to ${currentUserId}`);
        transferredCount += result.count;
        
      } catch (error) {
        console.error(`❌ Failed to transfer listings from ${duplicateUser.id}:`, error.message);
      }
    }
    
    console.log(`✅ Consolidation complete: ${transferredCount} listings transferred`);
    
    return {
      message: `Successfully consolidated ${transferredCount} listings`,
      transferredCount,
      fromUsers: duplicateUsers.map(u => u.id)
    };
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
      // Use explicit transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (prisma) => {
        console.log('🔄 Starting transaction for delete...');
        
        // Delete the listing within transaction
        const deleteResult = await prisma.listing.delete({
          where: { id },
        });
        console.log('✅ DELETE in transaction SUCCESSFUL:', deleteResult);
        
        // Verify deletion within same transaction
        const verifyDeleted = await prisma.listing.findUnique({ where: { id } });
        console.log('🔍 Verification in transaction:', verifyDeleted ? 'STILL EXISTS!' : 'CONFIRMED DELETED');
        
        return {
          deleteResult,
          verified: !verifyDeleted
        };
      });
      
      console.log('🎯 Transaction completed:', result);
      
      // Final verification outside transaction
      const finalCheck = await this.prisma.listing.findUnique({ where: { id } });
      console.log('🔍 FINAL verification outside transaction:', finalCheck ? 'STILL EXISTS!' : 'CONFIRMED DELETED');
      
      return { 
        message: 'Anunțul a fost șters cu succes',
        deletedId: id,
        verified: !finalCheck,
        transactionVerified: result.verified
      };
    } catch (error) {
      console.error('❌ DELETE/TRANSACTION FAILED:', error);
      throw error;
    }
  }
}
