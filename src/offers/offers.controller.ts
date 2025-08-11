import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OffersService } from './offers.service';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: { listingId: string; amount: number; currency?: string }) {
    return this.offersService.createOffer(req.user.id, dto);
  }

  @Get('listing/:listingId')
  async byListing(@Req() req: any, @Param('listingId') listingId: string) {
    return this.offersService.getOffersForListing(req.user.id, listingId);
  }

  @Post(':offerId/accept')
  async accept(@Req() req: any, @Param('offerId') offerId: string) {
    return this.offersService.acceptOffer(req.user.id, offerId);
  }
}


