import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BabyService } from './baby.service';
import {
  CreateBabyDto,
  CreateFeedingRecordDto,
  CreateDiaperRecordDto,
  CreateSleepRecordDto,
  DateRangeDto,
} from './dto/baby.dto';
import { GetUser } from '../auth/decorators';

@ApiTags('baby')
@ApiBearerAuth()
@Controller('baby')
@UseGuards(JwtAuthGuard)
export class BabyController {
  constructor(private readonly babyService: BabyService) { }

  @ApiOperation({ summary: 'Create a new baby profile' })
  @ApiResponse({ status: 201, description: 'Baby profile created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post()
  createBaby(@GetUser('id') userId: string, @Body() createBabyDto: CreateBabyDto) {
    return this.babyService.createBaby(userId, createBabyDto);
  }

  @Post(':id/feeding')
  createFeedingRecord(@Body() createFeedingDto: CreateFeedingRecordDto) {
    return this.babyService.createFeedingRecord(createFeedingDto);
  }

  @Post(':id/diaper')
  createDiaperRecord(@Body() createDiaperDto: CreateDiaperRecordDto) {
    return this.babyService.createDiaperRecord(createDiaperDto);
  }

  @Post(':id/sleep')
  createSleepRecord(@Body() createSleepDto: CreateSleepRecordDto) {
    return this.babyService.createSleepRecord(createSleepDto);
  }

  @Post(':id/feeding/analytics')
  getFeedingAnalytics(
    @Param('id') babyId: string,
    @Body() dateRange: DateRangeDto,
  ) {
    return this.babyService.getFeedingAnalytics(babyId, dateRange);
  }

  @Post(':id/diaper/analytics')
  getDiaperAnalytics(
    @Param('id') babyId: string,
    @Body() dateRange: DateRangeDto,
  ) {
    return this.babyService.getDiaperAnalytics(babyId, dateRange);
  }

  @Post(':id/sleep/analytics')
  getSleepAnalytics(
    @Param('id') babyId: string,
    @Body() dateRange: DateRangeDto,
  ) {
    return this.babyService.getSleepAnalytics(babyId, dateRange);
  }
}
