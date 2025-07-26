import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Baby } from './baby.entity';

export enum FeedingType {
  BREAST = 'breast',
  BOTTLE = 'bottle',
  SOLID = 'solid'
}

export enum BreastSide {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both'
}

@Entity('feeding_records')
export class FeedingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Baby, baby => baby.feedingRecords)
  baby: Baby;

  @Column({
    type: 'enum',
    enum: FeedingType
  })
  type: FeedingType;

  @Column({
    type: 'enum',
    enum: BreastSide,
    nullable: true
  })
  breastSide?: BreastSide;

  @Column({ nullable: true })
  amount: number; // in ml for bottle, minutes for breastfeeding

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  timestamp: Date;
}

@Entity('diaper_records')
export class DiaperRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Baby, baby => baby.diaperRecords)
  baby: Baby;

  @Column()
  type: 'pee' | 'poop' | 'both';

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  consistency: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  timestamp: Date;
}

@Entity('sleep_records')
export class SleepRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Baby, baby => baby.sleepRecords)
  baby: Baby;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  duration: number; // in minutes

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  timestamp: Date;
}
