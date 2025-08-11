import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  async getAllListings(
    @Query('category') category?: string,
    @Query('q') searchQuery?: string,
  ) {
    return this.listingsService.getAllListings(category, searchQuery);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createListing(@Body() createListingDto: any) {
    return this.listingsService.createListing(createListingDto);
  }
}
