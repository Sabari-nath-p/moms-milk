import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateDonorProfileDto {
  @IsDateString()
  babyDeliveryDate: Date;

  @IsString()
  bloodGroup: string;

  @IsBoolean()
  willingToShareTestResults: boolean;

  @IsString({ each: true })
  healthConditions: string[];
}

export class UpdateDonorProfileDto {
  @IsDateString()
  @IsOptional()
  babyDeliveryDate?: Date;

  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @IsBoolean()
  @IsOptional()
  willingToShareTestResults?: boolean;

  @IsString({ each: true })
  @IsOptional()
  healthConditions?: string[];

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
