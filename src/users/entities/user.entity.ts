import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Baby } from '../../baby/entities/baby.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  DONOR = 'donor',
  BUYER = 'buyer',
}

export enum UserStatus {
  EMAIL_VERIFICATION_PENDING = 'email_verification_pending',
  PROFILE_INCOMPLETE = 'profile_incomplete',
  ROLE_SELECTION_PENDING = 'role_selection_pending',
  COMPLETED = 'completed',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.EMAIL_VERIFICATION_PENDING
  })
  status: UserStatus;

  @Column({ nullable: true })
  deviceToken: string;

  @OneToMany(() => Baby, baby => baby.parent)
  babies: Baby[];

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole, nullable: true })
  role: UserRole;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
