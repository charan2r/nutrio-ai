import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MealScoreService } from './meal-score.service';
import { CreateMealScoreDto } from './dto/create-meal-score.dto';
import { UpdateMealScoreDto } from './dto/update-meal-score.dto';

@Controller('meal-score')
export class MealScoreController {
  constructor(private readonly mealScoreService: MealScoreService) {}

  @Post()
  create(@Body() createMealScoreDto: CreateMealScoreDto) {
    return this.mealScoreService.create(createMealScoreDto);
  }

  @Get()
  findAll() {
    return this.mealScoreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealScoreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMealScoreDto: UpdateMealScoreDto) {
    return this.mealScoreService.update(+id, updateMealScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealScoreService.remove(+id);
  }
}
