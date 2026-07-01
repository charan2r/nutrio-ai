import { Injectable } from '@nestjs/common';
import { CreateMealScoreDto } from './dto/create-meal-score.dto';
import { UpdateMealScoreDto } from './dto/update-meal-score.dto';

@Injectable()
export class MealScoreService {
  create(createMealScoreDto: CreateMealScoreDto) {
    return 'This action adds a new mealScore';
  }

  findAll() {
    return `This action returns all mealScore`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mealScore`;
  }

  update(id: number, updateMealScoreDto: UpdateMealScoreDto) {
    return `This action updates a #${id} mealScore`;
  }

  remove(id: number) {
    return `This action removes a #${id} mealScore`;
  }
}
