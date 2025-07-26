import { IsString, IsNotEmpty, IsOptional, IsDate, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FeedingType, BreastSide } from '../entities/tracking.entity';

export class CreateBabyDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'The name of the baby'
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: '2025-01-01',
        description: 'Date of birth of the baby',
        type: Date
    })
    @IsDate()
    @Type(() => Date)
    dateOfBirth: Date;

    @ApiPropertyOptional({
        example: 'male',
        description: 'Gender of the baby',
        enum: ['male', 'female', 'other']
    })
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiPropertyOptional({
        example: 3.5,
        description: 'Weight of the baby in kilograms',
        minimum: 0,
        maximum: 20
    })
    @IsNumber()
    @IsOptional()
    weight?: number;

    @ApiPropertyOptional({
        example: 50,
        description: 'Height of the baby in centimeters',
        minimum: 0,
        maximum: 200
    })
    @IsNumber()
    @IsOptional()
    height?: number;

    @ApiPropertyOptional({
        example: 'A+',
        description: 'Blood group of the baby',
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    })
    @IsString()
    @IsOptional()
    bloodGroup?: string;
}

export class CreateFeedingRecordDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'UUID of the baby'
    })
    @IsString()
    @IsNotEmpty()
    babyId: string;

    @ApiProperty({
        enum: FeedingType,
        example: FeedingType.BREAST,
        description: 'Type of feeding (breast, bottle, or solid)'
    })
    @IsEnum(FeedingType)
    type: FeedingType;

    @ApiPropertyOptional({
        enum: BreastSide,
        example: BreastSide.LEFT,
        description: 'Which breast was used for feeding (required for breast feeding)'
    })
    @IsEnum(BreastSide)
    @IsOptional()
    breastSide?: BreastSide;

    @ApiPropertyOptional({
        example: 120,
        description: 'Amount in ml for bottle feeding or minutes for breastfeeding',
        minimum: 0
    })
    @IsNumber()
    @IsOptional()
    amount?: number;

    @ApiPropertyOptional({
        example: 'Baby was very hungry and fed well',
        description: 'Additional notes about the feeding session'
    })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateDiaperRecordDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'UUID of the baby'
    })
    @IsString()
    @IsNotEmpty()
    babyId: string;

    @ApiProperty({
        enum: ['pee', 'poop', 'both'],
        example: 'both',
        description: 'Type of diaper change'
    })
    @IsString()
    @IsNotEmpty()
    type: 'pee' | 'poop' | 'both';

    @ApiPropertyOptional({
        example: 'yellow',
        description: 'Color of the stool/urine',
        enum: ['yellow', 'green', 'brown', 'black', 'red', 'white']
    })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({
        example: 'soft',
        description: 'Consistency of the stool',
        enum: ['liquid', 'soft', 'formed', 'hard']
    })
    @IsString()
    @IsOptional()
    consistency?: string;

    @ApiPropertyOptional({
        example: 'Normal healthy diaper',
        description: 'Additional notes about the diaper change'
    })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateSleepRecordDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'UUID of the baby'
    })
    @IsString()
    @IsNotEmpty()
    babyId: string;

    @ApiProperty({
        example: '2024-02-20T13:00:00Z',
        description: 'Start time of the sleep session (ISO 8601 format)'
    })
    @IsDateString()
    @IsNotEmpty()
    startTime: Date;

    @ApiPropertyOptional({
        example: '2024-02-20T15:30:00Z',
        description: 'End time of the sleep session (ISO 8601 format)'
    })
    @IsDateString()
    @IsOptional()
    endTime?: Date;

    @ApiProperty({
        enum: ['crib', 'bed', 'stroller', 'other'],
        example: 'crib',
        description: 'Location where the baby slept'
    })
    @IsString()
    @IsNotEmpty()
    location: 'crib' | 'bed' | 'stroller' | 'other';

    @ApiPropertyOptional({
        example: 150,
        description: 'Duration of sleep in minutes',
        minimum: 0
    })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiPropertyOptional({
        example: 'Slept well through the night',
        description: 'Additional notes about the sleep session'
    })
    @IsString()
    @IsOptional()
    notes?: string;
}

export class DateRangeDto {
    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @IsDate()
    @Type(() => Date)
    endDate: Date;
}
