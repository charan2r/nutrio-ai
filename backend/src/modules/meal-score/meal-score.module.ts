import { Module } from '@nestjs/common';
import { MealScoreService } from './meal-score.service';
import { MealScoreController } from './meal-score.controller';

@Module({
  controllers: [MealScoreController],
  providers: [MealScoreService],
})
export class MealScoreModule {}
