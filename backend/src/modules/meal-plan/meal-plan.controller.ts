/* eslint-disable prettier/prettier */
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, JwtUser } from '../user/user.decorator';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto';
import { MealPlanService } from './meal-plan.service';

@Controller('meal-plans')
@UseGuards(AuthGuard)
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}
  @Post('generate') generate(
    @CurrentUser() user: JwtUser,
    @Body() dto: GenerateMealPlanDto,
  ) {
    return this.mealPlanService.generateForUser(user.id, dto);
  }
}
