import { Controller, Get, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';

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
}
