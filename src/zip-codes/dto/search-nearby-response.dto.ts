import { ApiProperty } from '@nestjs/swagger';

class DonorDto {
  @ApiProperty({ description: 'Unique identifier of the donor' })
  id: string;

  @ApiProperty({ description: 'Full name of the donor' })
  full_name: string;

  @ApiProperty({ description: 'Email address of the donor' })
  email: string;

  @ApiProperty({ description: 'Postal code of the donor\'s location' })
  postal_code: string;

  @ApiProperty({ description: 'Name of the donor\'s location' })
  place_name: string;

  @ApiProperty({ description: 'Distance from search location in kilometers' })
  distance_km: string;

  @ApiProperty({ description: 'List of health conditions', type: [String] })
  health_conditions: string[];

  @ApiProperty({ description: 'Whether the donor is willing to share test results' })
  willing_to_share_test_results: boolean;

  @ApiProperty({ description: 'Blood group of the donor' })
  blood_group: string;

  @ApiProperty({ description: 'Date when the baby was delivered', type: 'string', format: 'date-time' })
  baby_delivery_date: string;
}

export class SearchNearbyResponseDto {
  @ApiProperty({ type: [DonorDto], description: 'List of donors matching the search criteria' })
  items: DonorDto[];

  @ApiProperty({ description: 'Total number of matching donors' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Total number of pages' })
  pages: number;
}
