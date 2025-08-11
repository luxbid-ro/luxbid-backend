import { Controller, Get, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private prisma: PrismaService) {}

  // Returns conversation details for an accepted offer (seller-buyer)
  @Get('offer/:offerId')
  async getConversationForOffer(@Req() req: any, @Param('offerId') offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        user: true,
        listing: { include: { user: true } },
      },
    });
    if (!offer || offer.status !== 'ACCEPTED') {
      throw new ForbiddenException('Offer not accepted');
    }

    const buyer = offer.user;
    const seller = offer.listing.user;

    // Ensure requester is involved
    if (![buyer.id, seller.id].includes(req.user.id)) {
      throw new ForbiddenException('Not allowed');
    }

    return {
      id: offer.id,
      listing: { id: offer.listingId, title: offer.listing.title },
      buyer: { id: buyer.id, name: buyer.firstName ? `${buyer.firstName} ${buyer.lastName}` : buyer.companyName || buyer.email },
      seller: { id: seller.id, name: seller.firstName ? `${seller.firstName} ${seller.lastName}` : seller.companyName || seller.email },
    };
  }

  // Returns messages list - simple stub (no persistence yet)
  @Get('conversations/:conversationId/messages')
  async getMessages() {
    return [];
  }
}


