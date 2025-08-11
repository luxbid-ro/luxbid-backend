import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async createOffer(userId: string, dto: { listingId: string; amount: number; currency?: string }) {
    const listing = await this.prisma.listing.findUnique({ where: { id: dto.listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.userId === userId) throw new ForbiddenException('Cannot offer on own listing');

    return this.prisma.offer.create({
      data: {
        listingId: dto.listingId,
        userId,
        amount: dto.amount,
        currency: dto.currency || listing.currency || 'RON',
        status: 'PENDING',
      },
    });
  }

  async getOffersForListing(requesterId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.userId !== requesterId) throw new ForbiddenException('Not allowed');

    const offers = await this.prisma.offer.findMany({
      where: { listingId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return offers.map((o: any) => ({
      id: o.id,
      amount: o.amount,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt,
      buyer: {
        id: o.user.id,
        name: o.user.firstName ? `${o.user.firstName} ${o.user.lastName}` : o.user.companyName || o.user.email,
      },
      user: { email: o.user.email },
    }));
  }

  async acceptOffer(requesterId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({ include: { listing: true }, where: { id: offerId } });
    if (!offer) throw new NotFoundException('Offer not found');
    if (offer.listing.userId !== requesterId) throw new ForbiddenException('Not allowed');

    // Mark offer accepted and mark all others as rejected
    await this.prisma.$transaction([
      this.prisma.offer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } }),
      this.prisma.offer.updateMany({ where: { listingId: offer.listingId, NOT: { id: offerId } }, data: { status: 'REJECTED' } }),
    ]);

    return { success: true };
  }
}


