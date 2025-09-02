import { Controller, Get, Delete, Param, UseGuards, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ListingsService } from '../listings/listings.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(
    private listingsService: ListingsService,
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  // Admin Supreme Authentication
  private validateAdminAccess(authorization: string): boolean {
    const expectedToken = 'admin-supreme-luxbid2024supreme';
    return authorization === `Bearer ${expectedToken}`;
  }

  // Get all users (Admin Supreme only)
  @Get('users')
  async getAllUsers(@Headers('authorization') authorization: string) {
    if (!this.validateAdminAccess(authorization)) {
      throw new HttpException('Unauthorized - Admin Supreme access required', HttpStatus.UNAUTHORIZED);
    }

    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          isAdmin: true,
          _count: {
            select: {
              listings: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return users;
    } catch (error) {
      throw new HttpException('Error fetching users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all listings with user info (Admin Supreme only)
  @Get('listings')
  async getAllListingsAdmin(@Headers('authorization') authorization: string) {
    if (!this.validateAdminAccess(authorization)) {
      throw new HttpException('Unauthorized - Admin Supreme access required', HttpStatus.UNAUTHORIZED);
    }

    try {
      const listings = await this.prisma.listing.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return listings;
    } catch (error) {
      throw new HttpException('Error fetching listings', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete any listing (Admin Supreme only)
  @Delete('listings/:id')
  async deleteListingAdmin(
    @Param('id') id: string,
    @Headers('authorization') authorization: string
  ) {
    if (!this.validateAdminAccess(authorization)) {
      throw new HttpException('Unauthorized - Admin Supreme access required', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Check if listing exists
      const listing = await this.prisma.listing.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!listing) {
        throw new HttpException('Listing not found', HttpStatus.NOT_FOUND);
      }

      // Delete the listing
      await this.prisma.listing.delete({
        where: { id }
      });

      // Log admin action
      console.log(`🗑️ [ADMIN SUPREME] Listing "${listing.title}" deleted by admin supreme`);
      console.log(`   User: ${listing.user.firstName} ${listing.user.lastName} (${listing.user.email})`);
      console.log(`   Listing ID: ${id}`);

      return {
        success: true,
        message: 'Listing deleted successfully by Admin Supreme',
        deletedListing: {
          id: listing.id,
          title: listing.title,
          user: listing.user
        }
      };
    } catch (error) {
      console.error('❌ [ADMIN SUPREME] Error deleting listing:', error);
      throw new HttpException('Error deleting listing', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete user and all their listings (Admin Supreme only)
  @Delete('users/:id')
  async deleteUserAdmin(
    @Param('id') userId: string,
    @Headers('authorization') authorization: string
  ) {
    if (!this.validateAdminAccess(authorization)) {
      throw new HttpException('Unauthorized - Admin Supreme access required', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Check if user exists and is not admin
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          listings: true
        }
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.isAdmin) {
        throw new HttpException('Cannot delete admin users', HttpStatus.FORBIDDEN);
      }

      // Delete user and all their listings (cascade)
      await this.prisma.$transaction(async (prisma) => {
        // First delete all listings
        await prisma.listing.deleteMany({
          where: { userId }
        });

        // Then delete the user
        await prisma.user.delete({
          where: { id: userId }
        });
      });

      // Log admin action
      console.log(`🗑️ [ADMIN SUPREME] User "${user.firstName} ${user.lastName}" deleted by admin supreme`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Listings deleted: ${user.listings.length}`);
      console.log(`   User ID: ${userId}`);

      return {
        success: true,
        message: 'User and all their listings deleted successfully by Admin Supreme',
        deletedUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          listingsDeleted: user.listings.length
        }
      };
    } catch (error) {
      console.error('❌ [ADMIN SUPREME] Error deleting user:', error);
      throw new HttpException('Error deleting user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get platform statistics (Admin Supreme only)
  @Get('stats')
  async getPlatformStats(@Headers('authorization') authorization: string) {
    if (!this.validateAdminAccess(authorization)) {
      throw new HttpException('Unauthorized - Admin Supreme access required', HttpStatus.UNAUTHORIZED);
    }

    try {
      const [
        totalUsers,
        totalListings,
        activeListings,
        totalValue,
        recentUsers,
        recentListings
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.listing.count(),
        this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
        this.prisma.listing.aggregate({
          _sum: { price: true }
        }),
        this.prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }),
        this.prisma.listing.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })
      ]);

      // Get category distribution
      const categoryStats = await this.prisma.listing.groupBy({
        by: ['category'],
        _count: {
          category: true
        }
      });

      // Get brand distribution
      const brandStats = await this.prisma.listing.groupBy({
        by: ['brand'],
        _count: {
          brand: true
        },
        orderBy: {
          _count: {
            brand: 'desc'
          }
        },
        take: 10
      });

      return {
        totalUsers,
        totalListings,
        activeListings,
        totalValue: totalValue._sum.price || 0,
        recentActivity: {
          newUsers24h: recentUsers,
          newListings24h: recentListings
        },
        categoryDistribution: categoryStats,
        topBrands: brandStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ [ADMIN SUPREME] Error fetching stats:', error);
      throw new HttpException('Error fetching platform statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get admin activity log (Admin Supreme only)
  @Get('activity-log')
  async getActivityLog(@Headers('authorization') authorization: string) {
    if (!this.validateAdminAccess(authorization)) {
      throw new HttpException('Unauthorized - Admin Supreme access required', HttpStatus.UNAUTHORIZED);
    }

    // This would typically come from a proper logging system
    // For now, return recent database activity
    try {
      const recentListings = await this.prisma.listing.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      const recentUsers = await this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      });

      return {
        recentListings: recentListings.map(listing => ({
          type: 'listing_created',
          timestamp: listing.createdAt,
          details: {
            listingId: listing.id,
            title: listing.title,
            price: listing.price,
            user: listing.user
          }
        })),
        recentUsers: recentUsers.map(user => ({
          type: 'user_registered',
          timestamp: user.createdAt,
          details: {
            userId: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`
          }
        }))
      };
    } catch (error) {
      console.error('❌ [ADMIN SUPREME] Error fetching activity log:', error);
      throw new HttpException('Error fetching activity log', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
