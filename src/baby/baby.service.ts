import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Baby } from './entities/baby.entity';
import { FeedingRecord, DiaperRecord, SleepRecord } from './entities/tracking.entity';
import {
  CreateBabyDto,
  CreateFeedingRecordDto,
  CreateDiaperRecordDto,
  CreateSleepRecordDto,
  DateRangeDto,
} from './dto/baby.dto';

@Injectable()
export class BabyService {
  constructor(
    @InjectRepository(Baby)
    private babyRepository: Repository<Baby>,
    @InjectRepository(FeedingRecord)
    private feedingRepository: Repository<FeedingRecord>,
    @InjectRepository(DiaperRecord)
    private diaperRepository: Repository<DiaperRecord>,
    @InjectRepository(SleepRecord)
    private sleepRepository: Repository<SleepRecord>,
  ) {}

  async createBaby(userId: string, createBabyDto: CreateBabyDto): Promise<Baby> {
    const baby = this.babyRepository.create({
      ...createBabyDto,
      parent: { id: userId },
    });
    return this.babyRepository.save(baby);
  }

  async createFeedingRecord(createFeedingDto: CreateFeedingRecordDto): Promise<FeedingRecord> {
    const baby = await this.babyRepository.findOne({
      where: { id: createFeedingDto.babyId },
    });
    if (!baby) throw new NotFoundException('Baby not found');

    const record = this.feedingRepository.create({
      ...createFeedingDto,
      baby,
    });
    return this.feedingRepository.save(record);
  }

  async createDiaperRecord(createDiaperDto: CreateDiaperRecordDto): Promise<DiaperRecord> {
    const baby = await this.babyRepository.findOne({
      where: { id: createDiaperDto.babyId },
    });
    if (!baby) throw new NotFoundException('Baby not found');

    const record = this.diaperRepository.create({
      ...createDiaperDto,
      baby,
    });
    return this.diaperRepository.save(record);
  }

  async createSleepRecord(createSleepDto: CreateSleepRecordDto): Promise<SleepRecord> {
    const baby = await this.babyRepository.findOne({
      where: { id: createSleepDto.babyId },
    });
    if (!baby) throw new NotFoundException('Baby not found');

    const record = this.sleepRepository.create({
      ...createSleepDto,
      baby,
      duration: createSleepDto.endTime
        ? Math.round((createSleepDto.endTime.getTime() - createSleepDto.startTime.getTime()) / 60000)
        : null,
    });
    return this.sleepRepository.save(record);
  }

  async getFeedingAnalytics(babyId: string, dateRange: DateRangeDto) {
    const records = await this.feedingRepository.find({
      where: {
        baby: { id: babyId },
        timestamp: Between(dateRange.startDate, dateRange.endDate),
      },
      order: { timestamp: 'ASC' },
    });

    return {
      totalFeedings: records.length,
      averagePerDay: records.length / (
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
      byType: this.groupByType(records, 'type'),
      timeline: records.map(r => ({
        time: r.timestamp,
        type: r.type,
        amount: r.amount,
      })),
    };
  }

  async getDiaperAnalytics(babyId: string, dateRange: DateRangeDto) {
    const records = await this.diaperRepository.find({
      where: {
        baby: { id: babyId },
        timestamp: Between(dateRange.startDate, dateRange.endDate),
      },
      order: { timestamp: 'ASC' },
    });

    return {
      totalChanges: records.length,
      averagePerDay: records.length / (
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
      byType: this.groupByType(records, 'type'),
      timeline: records.map(r => ({
        time: r.timestamp,
        type: r.type,
      })),
    };
  }

  async getSleepAnalytics(babyId: string, dateRange: DateRangeDto) {
    const records = await this.sleepRepository.find({
      where: {
        baby: { id: babyId },
        startTime: Between(dateRange.startDate, dateRange.endDate),
      },
      order: { startTime: 'ASC' },
    });

    const completedRecords = records.filter(r => r.duration);

    return {
      totalSleepSessions: records.length,
      averageDuration: completedRecords.length
        ? completedRecords.reduce((acc, curr) => acc + curr.duration, 0) / completedRecords.length
        : 0,
      timeline: records.map(r => ({
        start: r.startTime,
        end: r.endTime,
        duration: r.duration,
      })),
      totalSleepTime: completedRecords.reduce((acc, curr) => acc + curr.duration, 0),
    };
  }

  private groupByType<T>(records: T[], key: keyof T) {
    return records.reduce((acc, curr) => {
      const type = curr[key] as string;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
