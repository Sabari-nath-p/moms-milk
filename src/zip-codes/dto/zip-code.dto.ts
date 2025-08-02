import { IsString, IsNumber, IsOptional, IsLatitude, IsLongitude, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateZipCodeDto {
  @ApiProperty({
    description: 'Two-letter country code (ISO 3166-1 alpha-2)',
    example: 'US'
  })
  @IsString()
  countryCode: string;

  @ApiProperty({
    description: 'Postal code/ZIP code',
    example: '90210'
  })
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Name of the place/city',
    example: 'Beverly Hills'
  })
  @IsString()
  placeName: string;

  @ApiProperty({
    description: 'Latitude coordinate of the location',
    example: 34.0901,
    minimum: -90,
    maximum: 90
  })
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the location',
    example: -118.4065,
    minimum: -180,
    maximum: 180
  })
  @IsNumber()
  @IsLongitude()
  longitude: number;
}

export class UpdateZipCodeDto extends CreateZipCodeDto { }

export class ZipCodeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class SearchNearbyDto {
  @ApiProperty({
    description: 'ZIP code to search from',
    example: '90210'
  })
  @IsString()
  zipCode: string;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    default: 50,
    minimum: 1,
    maximum: 500
  })
  @IsOptional()
  @IsNumber()
  radius?: number = 50;

  @ApiPropertyOptional({
    description: 'Start date for filtering by baby delivery date (ISO format)',
    example: '2025-01-01',
    type: 'string',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  babyDeliveryDateStart?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering by baby delivery date (ISO format)',
    example: '2025-12-31',
    type: 'string',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  babyDeliveryDateEnd?: string;

  @ApiPropertyOptional({
    description: 'Filter donors by their willingness to share test results',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  willingToShareTestResults?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
