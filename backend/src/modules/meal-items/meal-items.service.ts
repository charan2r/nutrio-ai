import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealItem } from './entities/meal-item.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';

@Injectable()
export class MealItemsService {
  constructor(
    @InjectRepository(MealItem)
    private readonly mealItemsRepo: Repository<MealItem>,
    @InjectRepository(MealPlan)
    private readonly mealPlansRepo: Repository<MealPlan>,
  ) {}

  async toggleStatus(userId: string, mealItemId: string) {
    const item = await this.mealItemsRepo.findOne({
      where: { id: mealItemId },
      relations: ['mealPlan'],
    });

    if (!item) {
      throw new NotFoundException('Meal item not found');
    }

    if (item.mealPlan?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this meal item');
    }

    const isCurrentlyCompleted = item.status === 'completed';
    item.status = isCurrentlyCompleted ? 'scheduled' : 'completed';
    item.consumedServings = isCurrentlyCompleted
      ? null
      : Number(item.servings || 1);

    return this.mealItemsRepo.save(item);
  }

  async updateStatus(
    userId: string,
    mealItemId: string,
    status: string,
    consumedServings?: number,
  ) {
    const item = await this.mealItemsRepo.findOne({
      where: { id: mealItemId },
      relations: ['mealPlan'],
    });

    if (!item) {
      throw new NotFoundException('Meal item not found');
    }

    if (item.mealPlan?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this meal item');
    }

    item.status = status;
    if (status === 'completed') {
      item.consumedServings =
        consumedServings ?? Number(item.servings || 1);
    } else {
      item.consumedServings = null;
    }

    return this.mealItemsRepo.save(item);
  }

  async findOne(userId: string, mealItemId: string) {
    const item = await this.mealItemsRepo.findOne({
      where: { id: mealItemId },
      relations: ['mealPlan'],
    });

    if (!item) {
      throw new NotFoundException('Meal item not found');
    }

    if (item.mealPlan?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this meal item');
    }

    return item;
  }
}
