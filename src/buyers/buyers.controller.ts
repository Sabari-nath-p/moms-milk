import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('buyers')
@UseGuards(JwtAuthGuard)
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) {}

  @Post('profile')
  async createProfile(@Request() req) {
    return this.buyersService.createProfile(req.user.id);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    return this.buyersService.getProfile(req.user.id);
  }
}
