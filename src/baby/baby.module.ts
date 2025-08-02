import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BabyController } from './baby.controller';
import { BabyService } from './baby.service';
import { Baby } from './entities/baby.entity';
import { FeedingRecord, DiaperRecord, SleepRecord } from './entities/tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Baby, FeedingRecord, DiaperRecord, SleepRecord]),
  ],
  controllers: [BabyController],
  providers: [BabyService],
  exports: [BabyService],
})
export class BabyModule { }
