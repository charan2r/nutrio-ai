import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReplaceMealItemDto {
  @IsString()
  name: string;

  @IsNumber()
  calories: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsNumber()
  budgetLkr?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsArray()
  ingredients?: Array<{ name: string; quantity: number; unit: string }>;

  @IsOptional()
  @IsArray()
  instructions?: string[];

  @IsOptional()
  @IsString()
  mealId?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
