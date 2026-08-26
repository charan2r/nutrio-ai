import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealItemsService } from './meal-items.service';
import { MealItemsController } from './meal-items.controller';
import { MealItem } from './entities/meal-item.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealItem, MealPlan])],
  controllers: [MealItemsController],
  providers: [MealItemsService],
  exports: [MealItemsService],
})
export class MealItemsModule {}
