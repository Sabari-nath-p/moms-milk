import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonorProfileDto, UpdateDonorProfileDto } from './dto/donor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('donors')
@UseGuards(JwtAuthGuard)
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post('profile')
  async createProfile(@Request() req, @Body() createDonorProfileDto: CreateDonorProfileDto) {
    return this.donorsService.createProfile(req.user.id, createDonorProfileDto);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateDonorProfileDto: UpdateDonorProfileDto) {
    return this.donorsService.updateProfile(req.user.id, updateDonorProfileDto);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.donorsService.getProfile(req.user.id);
  }

  @Get('available/:zipCode')
  async getAvailableDonors(@Param('zipCode') zipCode: string) {
    return this.donorsService.findAvailableDonors(zipCode);
  }

  @Put('toggle-availability')
  async toggleAvailability(@Request() req) {
    return this.donorsService.toggleAvailability(req.user.id);
  }
}
