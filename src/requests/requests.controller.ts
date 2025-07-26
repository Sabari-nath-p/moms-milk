import { Body, Controller, Get, Param, Post, Put, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestStatus } from './entities/request.entity';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post(':donorId')
  async createRequest(@Request() req, @Param('donorId') donorId: string) {
    return this.requestsService.createRequest(req.user.id, donorId);
  }

  @Put(':requestId/status')
  async updateRequestStatus(
    @Request() req,
    @Param('requestId') requestId: string,
    @Body('status') status: RequestStatus,
  ) {
    if (![RequestStatus.ACCEPTED, RequestStatus.REJECTED].includes(status)) {
      throw new UnauthorizedException('Invalid status update. Only ACCEPTED or REJECTED are allowed.');
    }
    return this.requestsService.updateRequestStatus(requestId, req.user.id, status);
  }

  @Get('buyer')
  async getBuyerRequests(@Request() req) {
    return this.requestsService.getBuyerRequests(req.user.id);
  }

  @Get('donor')
  async getDonorRequests(@Request() req) {
    return this.requestsService.getDonorRequests(req.user.id);
  }
}
