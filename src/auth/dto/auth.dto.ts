import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '12345', description: 'ZIP code' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ enum: UserRole, description: 'User role (donor or buyer)' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({
    example: 'https://example.com/profile.jpg',
    description: 'URL of the profile picture'
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;
}

export class NotificationDto {
  @ApiProperty({
    enum: ['all', 'zipcode', 'user'],
    description: 'Type of notification target'
  })
  @IsEnum(['all', 'zipcode', 'user'])
  type: 'all' | 'zipcode' | 'user';

  @ApiProperty({
    example: 'New Milk Available',
    description: 'Subject of the notification'
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'A new donor has registered in your area',
    description: 'Message content of the notification'
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    example: '12345',
    description: 'ZIP code for targeted notifications'
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID for targeted notifications'
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'User role for targeted notifications'
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    example: { donorId: '123', milkAmount: '500ml' },
    description: 'Additional data to be sent with push notification'
  })
  @IsOptional()
  data?: { [key: string]: string };
}

export class UpdateFCMTokenDto {
  @ApiProperty({
    example: 'your-fcm-token-here',
    description: 'Firebase Cloud Messaging token for push notifications'
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
