import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('donors')
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  babyDeliveryDate: Date;

  @Column()
  bloodGroup: string;

  @Column()
  willingToShareTestResults: boolean;

  @Column('simple-array')
  healthConditions: string[];

  @Column({ default: true })
  isAvailable: boolean;
}
