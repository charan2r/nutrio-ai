/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { MealPlanController } from './meal-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { Allergy } from '../allergy/entities/allergy.entity';
import { UserProfile } from '../profile/entities/profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { MealPlan } from './entities/meal-plan.entity';
import { MealPlanRequest } from '../meal-plan-request/entities/meal-plan-request.entity';
import { MealItem } from '../meal-items/entities/meal-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfile,
      UserPreference,
      Allergy,
      MealPlanRequest,
      MealPlan,
      MealItem,
    ]),
    AiModule,
  ],
  controllers: [MealPlanController],
  providers: [MealPlanService],
})
export class MealPlanModule {}
