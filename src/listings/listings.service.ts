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
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return listings;
  }
}
