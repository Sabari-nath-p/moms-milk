import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FeedingRecord, DiaperRecord, SleepRecord } from './tracking.entity';

@Entity('babies')
export class Baby {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  bloodGroup: string;

  @ManyToOne(() => User, user => user.babies)
  parent: User;

  @OneToMany(() => FeedingRecord, record => record.baby)
  feedingRecords: FeedingRecord[];

  @OneToMany(() => DiaperRecord, record => record.baby)
  diaperRecords: DiaperRecord[];

  @OneToMany(() => SleepRecord, record => record.baby)
  sleepRecords: SleepRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
