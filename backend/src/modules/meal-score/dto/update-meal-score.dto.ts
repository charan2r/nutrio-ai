import { PartialType } from '@nestjs/mapped-types';
import { CreateMealScoreDto } from './create-meal-score.dto';

export class UpdateMealScoreDto extends PartialType(CreateMealScoreDto) {}
