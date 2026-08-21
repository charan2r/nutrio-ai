/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AiService } from '../ai/ai.service';
import { Allergy } from '../allergy/entities/allergy.entity';
import { UserProfile } from '../profile/entities/profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto';
import { MealPlan } from './entities/meal-plan.entity';
import { MealPlanRequest } from '../meal-plan-request/entities/meal-plan-request.entity';
import { MealItem } from '../meal-items/entities/meal-item.entity';

export type MealPlanGenerationContext = {
  age: number;
  biologicalSex: string;
  heightCm: number;
  weightKg: number;
  goal: string;
  activityLevel: string;
  dailyCalorieTarget: number;
  dietType: string;
  appetiteLevel: string;
  mealsPerDay: number;
  dailyBudget: number | null;
  preferredCuisines: string[];
  excludedIngredients: string[];
  dislikedFoods: string[];
  maximumPrepMinutes: number | null;
  cookingSkill: string | null;
  servings: number;
  allergies: string[];
  startDate: string;
  durationDays: number;
  strictCalorieControl: boolean;
};

@Injectable()
export class MealPlanService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profiles: Repository<UserProfile>,
    @InjectRepository(UserPreference)
    private readonly preferences: Repository<UserPreference>,
    @InjectRepository(Allergy) private readonly allergies: Repository<Allergy>,
    @InjectRepository(MealPlanRequest)
    private readonly requests: Repository<MealPlanRequest>,
    private readonly dataSource: DataSource,
    private readonly aiService: AiService,
  ) {}

  async generateForUser(userId: string, dto: GenerateMealPlanDto) {
    const [profile, preferences, allergies] = await Promise.all([
      this.profiles.findOneBy({ userId }),
      this.preferences.findOneBy({ userId }),
      this.allergies.find({ where: { userId } }),
    ]);
    if (!profile || !preferences)
      throw new NotFoundException(
        'Complete your profile and preferences before generating a meal plan',
      );
    const context: MealPlanGenerationContext = {
      age: this.calculateAge(profile.dateOfBirth),
      biologicalSex: profile.biologicalSex,
      heightCm: Number(profile.heightCm),
      weightKg: Number(profile.weightKg),
      goal: profile.goal,
      activityLevel: profile.activityLevel,
      dailyCalorieTarget: preferences.dailyCalorieTarget,
      dietType: preferences.dietType,
      appetiteLevel: preferences.appetiteLevel,
      mealsPerDay: preferences.mealsPerDay,
      dailyBudget:
        preferences.dailyBudget === null
          ? null
          : Number(preferences.dailyBudget),
      preferredCuisines: preferences.preferredCuisines,
      excludedIngredients: preferences.excludedIngredients,
      dislikedFoods: preferences.dislikedFoods,
      maximumPrepMinutes: preferences.maximumPrepMinutes,
      cookingSkill: preferences.cookingSkill,
      servings: preferences.servings,
      allergies: allergies.map((allergy) => allergy.allergen),
      startDate: dto.startDate,
      durationDays: dto.durationDays ?? 7,
      strictCalorieControl: dto.strictCalorieControl ?? false,
    };
    // Persist before the provider call so unsuccessful AI attempts remain traceable.
    const request = await this.requests.save(
      this.requests.create({
        userId,
        startDate: context.startDate,
        durationDays: context.durationDays,
        targetCalories: preferences.dailyCalorieTarget,
        inputSnapshot: context,
        requestHash: null,
        strictCalorieControl: context.strictCalorieControl,
      }),
    );

    const result = await this.aiService.generateMealPlan(context);
    const savedPlan = await this.persistGeneratedPlan(
      userId,
      request,
      result.plan,
      result.model,
      result.attempts,
    );
    return {
      plan: savedPlan.plan,
      planId: savedPlan.plan.id,
      requestId: request.id,
      items: savedPlan.items,
      generation: {
        provider: 'groq',
        model: result.model,
        attempts: result.attempts,
      },
      validation: { structureValid: true, safetyValidated: false },
    };
  }

  private async persistGeneratedPlan(
    userId: string,
    request: MealPlanRequest,
    generatedPlan: Awaited<ReturnType<AiService['generateMealPlan']>>['plan'],
    model: string,
    attempts: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const planRepository = manager.getRepository(MealPlan);
      const itemRepository = manager.getRepository(MealItem);
      const totals = generatedPlan.days.flatMap((day) => day.meals).reduce(
        (sum, meal) => ({
          calories: sum.calories + meal.calories * meal.servings,
          protein: sum.protein + meal.protein * meal.servings,
          carbs: sum.carbs + meal.carbs * meal.servings,
          fat: sum.fat + meal.fat * meal.servings,
          cost: sum.cost + (meal.estimatedCostLkr ?? 0) * meal.servings,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 },
      );
      const plan = await planRepository.save(
        planRepository.create({
          userId,
          requestId: request.id,
          startDate: request.startDate,
          endDate: this.addDays(request.startDate, request.durationDays - 1),
          // Full safety/nutrition approval is deliberately deferred to Milestone 3.
          status: 'validating',
          generationMethod: 'ai',
          provider: 'groq',
          modelUsed: model,
          promptVersion: 'v1',
          validationSummary: {
            structureValid: true,
            safetyValidated: false,
            nutritionVerified: false,
          },
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFat: totals.fat,
          estimatedCostLkr: totals.cost,
          generationMeta: { retryCount: attempts - 1 },
        }),
      );
      const items = generatedPlan.days.flatMap((day) =>
        day.meals.map((meal) =>
          itemRepository.create({
            mealPlanId: plan.id,
            day: day.day,
            mealType: meal.mealType,
            mealId: null,
            generatedMealSnapshot: meal,
            servings: meal.servings,
            caloriesSnapshot: meal.calories,
            proteinSnapshot: meal.protein,
            carbsSnapshot: meal.carbs,
            fatSnapshot: meal.fat,
            estimatedCostSnapshot: meal.estimatedCostLkr ?? null,
            nutritionVerificationStatus: 'unverified',
            selectionExplanation: { reason: meal.reason },
            status: 'scheduled',
          }),
        ),
      );
      return { plan, items: await itemRepository.save(items) };
    });
  }

  private calculateAge(dateOfBirth: string) {
    const birth = new Date(`${dateOfBirth}T00:00:00Z`);
    const today = new Date();
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    if (
      today.getUTCMonth() < birth.getUTCMonth() ||
      (today.getUTCMonth() === birth.getUTCMonth() &&
        today.getUTCDate() < birth.getUTCDate())
    )
      age--;
    return age;
  }

  private addDays(date: string, days: number) {
    const value = new Date(`${date}T00:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  }
}
