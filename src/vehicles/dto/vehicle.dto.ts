import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsArray,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleStatus } from '../vehicle.schema';

export class CreateVehicleDto {
  @IsString()
  @MinLength(1)
  brand: string;

  @IsString()
  @MinLength(1)
  model: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  fuel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  fuel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}

export class VehicleFilterDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  minYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
