import { Controller, Get, Post, Query, Body, UseGuards, Param, Put, Req, Delete } from '@nestjs/common';
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
  async createListing(@Req() req: any, @Body() createListingDto: any) {
    return this.listingsService.createListing({ ...createListingDto, userId: req.user.id });
  }

  // Listing details by id (expected by frontend)
  @Get(':id')
  async getListingById(@Param('id') id: string) {
    return this.listingsService.getListingById(id);
  }

  // My listings (expected by frontend)
  @Get('me/all')
  @UseGuards(JwtAuthGuard)
  async getMyListings(@Req() req: any) {
    return this.listingsService.getMyListings(req.user.id);
  }

  // Update listing (expected by frontend)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateListing(@Param('id') id: string, @Body() updateDto: any, @Req() req: any) {
    return this.listingsService.updateListing(id, req.user.id, updateDto);
  }

  // Delete listing (new endpoint)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteListing(@Param('id') id: string, @Req() req: any) {
    return this.listingsService.deleteListing(id, req.user.id);
  }
}
