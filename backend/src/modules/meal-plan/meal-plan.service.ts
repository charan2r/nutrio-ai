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
import { Meal } from '../meal/entities/meal.entity';
import { GroceryListService } from '../grocery-list/grocery-list.service';
import {
  FullPlanValidationResult,
  MealPlanValidationService,
} from '../validation/meal-plan-validation.service';

import { Feedback } from '../feedback/entities/feedback.entity';

export type VerifiedMealSummary = {
  id: string;
  name: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedCostLkr: number | null;
  prepTimeMinutes: number | null;
  allergens: string[];
  dietTags: string[];
  ingredients?: any[];
};

export type UserFeedbackContext = {
  likedMeals: string[];
  dislikedMeals: string[];
  feedbackNotes: string[];
};

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
  verifiedMeals?: VerifiedMealSummary[];
  userFeedback?: UserFeedbackContext;
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
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealsRepository: Repository<Meal>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly dataSource: DataSource,
    private readonly aiService: AiService,
    private readonly validationService: MealPlanValidationService,
    private readonly groceryListService: GroceryListService,
  ) {}

  async findAllForUser(userId: string) {
    const plans = await this.mealPlanRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['items', 'groceryList'],
    });

    return plans.map((plan) => ({
      id: plan.id,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status,
      qualityScore:
        plan.qualityScore !== null ? Number(plan.qualityScore) : null,
      scoreBreakdown: plan.scoreBreakdown,
      validationSummary: plan.validationSummary,
      totalCalories:
        plan.totalCalories !== null ? Number(plan.totalCalories) : null,
      estimatedCostLkr:
        plan.estimatedCostLkr !== null ? Number(plan.estimatedCostLkr) : null,
      itemCount: plan.items ? plan.items.filter((it) => it.status !== 'replaced').length : 0,
      hasGroceryList: Boolean(plan.groceryList),
      createdAt: plan.createdAt,
    }));
  }

  async findOneForUser(userId: string, id: string) {
    const plan = await this.mealPlanRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.meal', 'groceryList'],
      order: {
        items: {
          day: 'ASC',
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    const activeItems = (plan.items || []).filter((it) => it.status !== 'replaced');

    return {
      id: plan.id,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status,
      qualityScore:
        plan.qualityScore !== null ? Number(plan.qualityScore) : null,
      scoreBreakdown: plan.scoreBreakdown,
      validationSummary: plan.validationSummary,
      totalCalories:
        plan.totalCalories !== null ? Number(plan.totalCalories) : null,
      totalProtein:
        plan.totalProtein !== null ? Number(plan.totalProtein) : null,
      totalCarbs: plan.totalCarbs !== null ? Number(plan.totalCarbs) : null,
      totalFat: plan.totalFat !== null ? Number(plan.totalFat) : null,
      estimatedCostLkr:
        plan.estimatedCostLkr !== null ? Number(plan.estimatedCostLkr) : null,
      generationMethod: plan.generationMethod,
      provider: plan.provider,
      modelUsed: plan.modelUsed,
      generationMeta: plan.generationMeta,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      mealItems: activeItems,
      groceryList: plan.groceryList || null,
    };
  }

  async generateForUser(userId: string, dto: GenerateMealPlanDto) {
    const [profile, preferences, allergies, verifiedMealsDb, userFeedbacks] =
      await Promise.all([
        this.profiles.findOneBy({ userId }),
        this.preferences.findOneBy({ userId }),
        this.allergies.find({ where: { userId } }),
        this.mealsRepository.find({
          where: {
            nutritionVerificationStatus: 'verified',
            isActive: true,
          },
        }),
        this.feedbackRepository.find({
          where: { userId },
          order: { createdAt: 'DESC' },
          take: 30,
        }),
      ]);
    if (!profile || !preferences)
      throw new NotFoundException(
        'Complete your profile and preferences before generating a meal plan',
      );

    // Extract user feedback preferences
    const likedMeals: string[] = [];
    const dislikedMeals: string[] = [];
    const feedbackNotes: string[] = [];

    for (const fb of userFeedbacks) {
      const name = fb.mealName?.trim();
      if (name) {
        if (fb.liked === true || (fb.rating !== null && Number(fb.rating) >= 4)) {
          if (!likedMeals.includes(name)) likedMeals.push(name);
        } else if (fb.liked === false || (fb.rating !== null && Number(fb.rating) <= 2)) {
          if (!dislikedMeals.includes(name)) dislikedMeals.push(name);
        }
      }

      const tags = fb.reasonTags || [];
      if (tags.includes('spicy')) {
        feedbackNotes.push(
          `Tone down spice levels (User found ${name || 'past meals'} too spicy).`,
        );
      }
      if (tags.includes('expensive')) {
        feedbackNotes.push(
          `Prioritize affordable, economical ingredients (User noted ${name || 'past meals'} was expensive).`,
        );
      }
      if (tags.includes('hard_prep')) {
        feedbackNotes.push(
          `Favor quick & easy preparation methods (User noted ${name || 'past meals'} was hard to prepare).`,
        );
      }
      if (tags.includes('unavailable')) {
        feedbackNotes.push(
          `Use accessible local ingredients (User noted ingredients in ${name || 'past meals'} were hard to find).`,
        );
      }
      if (tags.includes('small_portion')) {
        feedbackNotes.push(
          `Ensure hearty portions (User noted ${name || 'past meals'} had small portion).`,
        );
      }
      if (fb.comment && fb.comment.trim()) {
        feedbackNotes.push(`User comment on ${name || 'meal'}: "${fb.comment.trim()}"`);
      }
    }

    const userAllergens = [
      ...allergies.map((a) => a.allergen),
      ...(preferences.excludedIngredients || []),
    ].map((a) => a.toLowerCase().trim());

    const userDiet = (preferences.dietType || 'non-veg').toLowerCase().trim();

    // Filter verified meals shortlist matching user's diet and allergies, excluding disliked meals
    const suitableVerifiedMeals: VerifiedMealSummary[] = verifiedMealsDb
      .filter((m) => {
        const mealAllergens = (m.allergens || []).map((a) =>
          a.toLowerCase().trim(),
        );
        const hasAllergenConflict = userAllergens.some((ua) =>
          mealAllergens.some((ma) => ma.includes(ua) || ua.includes(ma)),
        );
        if (hasAllergenConflict) return false;

        // Check if meal was marked disliked in past feedback
        const isDisliked = dislikedMeals.some(
          (dm) =>
            m.name.toLowerCase().includes(dm.toLowerCase()) ||
            dm.toLowerCase().includes(m.name.toLowerCase()),
        );
        if (isDisliked) return false;

        if (userDiet === 'vegetarian') {
          const tags = (m.dietTags || []).map((t) => t.toLowerCase());
          if (!tags.includes('vegetarian') && !tags.includes('vegan')) {
            return false;
          }
        } else if (userDiet === 'vegan') {
          const tags = (m.dietTags || []).map((t) => t.toLowerCase());
          if (!tags.includes('vegan')) {
            return false;
          }
        }
        return true;
      })
      .slice(0, 15)
      .map((m) => ({
        id: m.id,
        name: m.name,
        mealType: m.mealType,
        calories: Number(m.calories),
        protein: Number(m.protein),
        carbs: Number(m.carbs),
        fat: Number(m.fat),
        estimatedCostLkr:
          m.estimatedCostLkr !== null ? Number(m.estimatedCostLkr) : null,
        prepTimeMinutes: m.prepTimeMinutes,
        allergens: m.allergens || [],
        dietTags: m.dietTags || [],
        ingredients: m.ingredients as any[],
      }));

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
      verifiedMeals: suitableVerifiedMeals,
      userFeedback: {
        likedMeals,
        dislikedMeals,
        feedbackNotes,
      },
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
    const validationResult = this.validationService.validatePlan(
      result.plan,
      context,
    );

    const savedPlan = await this.persistGeneratedPlan(
      userId,
      request,
      result.plan,
      result.model,
      result.provider,
      result.attempts,
      validationResult,
      verifiedMealsDb,
    );

    return {
      plan: savedPlan.plan,
      planId: savedPlan.plan.id,
      requestId: request.id,
      items: savedPlan.items,
      groceryList: savedPlan.groceryList,
      generation: {
        provider: result.provider,
        model: result.model,
        attempts: result.attempts,
      },
      validation: validationResult.validationSummary,
      qualityScore: validationResult.qualityScore,
      scoreBreakdown: validationResult.scoreBreakdown,
      validationDetails: validationResult.details,
    };
  }

  private async persistGeneratedPlan(
    userId: string,
    request: MealPlanRequest,
    generatedPlan: Awaited<ReturnType<AiService['generateMealPlan']>>['plan'],
    model: string,
    provider: string,
    attempts: number,
    validationResult: FullPlanValidationResult,
    verifiedMealsDb: Meal[],
  ) {
    const verifiedMap = new Map<string, Meal>();
    for (const vm of verifiedMealsDb) {
      verifiedMap.set(vm.id, vm);
    }

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
          status: validationResult.isValid ? 'validated' : 'failed',
          generationMethod: 'ai',
          provider: provider || 'gemini',
          modelUsed: model,
          promptVersion: 'v1',
          validationSummary: validationResult.validationSummary,
          qualityScore: validationResult.qualityScore,
          scoreBreakdown: validationResult.scoreBreakdown,
          scoreVersion: 'v1',
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFat: totals.fat,
          estimatedCostLkr: totals.cost,
          generationMeta: { retryCount: attempts - 1 },
        }),
      );

      const itemsToSave = generatedPlan.days.flatMap((day) =>
        day.meals.map((meal) => {
          const matchedDbMeal = meal.mealId ? verifiedMap.get(meal.mealId) : null;
          const isVerified = Boolean(matchedDbMeal);

          return itemRepository.create({
            mealPlanId: plan.id,
            day: day.day,
            mealType: meal.mealType,
            mealId: matchedDbMeal ? matchedDbMeal.id : null,
            generatedMealSnapshot: isVerified ? null : meal,
            servings: meal.servings,
            caloriesSnapshot: isVerified
              ? Number(matchedDbMeal!.calories)
              : meal.calories,
            proteinSnapshot: isVerified
              ? Number(matchedDbMeal!.protein)
              : meal.protein,
            carbsSnapshot: isVerified
              ? Number(matchedDbMeal!.carbs)
              : meal.carbs,
            fatSnapshot: isVerified ? Number(matchedDbMeal!.fat) : meal.fat,
            estimatedCostSnapshot: isVerified
              ? matchedDbMeal!.estimatedCostLkr !== null
                ? Number(matchedDbMeal!.estimatedCostLkr)
                : null
              : meal.estimatedCostLkr ?? null,
            nutritionVerificationStatus: isVerified ? 'verified' : 'unverified',
            nutritionSource: isVerified ? 'database' : null,
            selectionExplanation: {
              reason: meal.reason,
              allergens: meal.allergens,
              dietTags: meal.dietTags,
              isReusedVerifiedMeal: isVerified,
            },
            status: 'scheduled',
          });
        }),
      );

      const savedItems = await itemRepository.save(itemsToSave);

      // Generate and save Grocery List
      const allMealsForGrocery = generatedPlan.days.flatMap((day) =>
        day.meals.map((meal) => {
          const matchedDbMeal = meal.mealId ? verifiedMap.get(meal.mealId) : null;
          return {
            name: meal.name,
            servings: meal.servings,
            ingredients: matchedDbMeal
              ? (matchedDbMeal.ingredients as any[]) || meal.ingredients
              : meal.ingredients,
            estimatedCostLkr: meal.estimatedCostLkr,
          };
        }),
      );

      const groceryList = await this.groceryListService.generateForPlan(
        plan.id,
        allMealsForGrocery,
        manager,
      );

      return { plan, items: savedItems, groceryList };
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
