import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  getHello(): string {
    return 'LuxBid Backend is running!';
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'luxbid-backend'
    };
  }

  @Get('health/db')
  async getDbHealth(): Promise<object> {
    try {
      const usersCount = await this.prisma.user.count();
      return {
        status: 'healthy',
        db: 'ok',
        usersCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('DB health error:', { message: error?.message, code: error?.code });
      return {
        status: 'degraded',
        db: 'error',
        error: { message: error?.message, code: error?.code },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Temporary stubs for notifications endpoints used by frontend
  @Get('notifications/unread-count')
  getUnreadCount() {
    return { unreadCount: 0 };
  }

  @Get('notifications')
  getNotifications() {
    return { notifications: [] };
  }

  @Get('notifications/mark-read')
  markRead() {
    return { success: true };
  }

  @Get('notifications/mark-all-read')
  markAllRead() {
    return { success: true };
  }
}

  // EMERGENCY: Complete endpoint stubs for immediate functionality
  @Get('users/me')
  async getUserMe() {
    return { id: 'temp-user', email: 'user@luxbid.ro', firstName: 'Test', lastName: 'User' };
  }

  @Post('offers')
  async createOffer() {
    return { id: 'temp-offer', status: 'PENDING', message: 'Offer created' };
  }

  @Get('offers/listing/:listingId')
  async getOffersForListing() {
    return [];
  }

  @Post('offers/:offerId/accept')
  async acceptOffer() {
    return { success: true };
  }

  @Get('upload/images/:listingId')
  async getImages() {
    return [];
  }

  @Post('upload/images/:listingId')
  async uploadImages() {
    return { images: [] };
  }

  @Get('chat/offer/:offerId')
  async getChatOffer() {
    return { id: 'temp-chat', listing: { title: 'Test' }, buyer: { name: 'Buyer' }, seller: { name: 'Seller' } };
  }

  @Get('chat/conversations/:conversationId/messages')
  async getChatMessages() {
    return [];
  }
