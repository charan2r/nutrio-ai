import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealItem } from './entities/meal-item.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { Meal } from '../meal/entities/meal.entity';
import { UserProfile } from '../profile/entities/profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { Allergy } from '../allergy/entities/allergy.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { AiService } from '../ai/ai.service';
import { ReplaceMealItemDto } from './dto/replace-meal-item.dto';

@Injectable()
export class MealItemsService {
  constructor(
    @InjectRepository(MealItem)
    private readonly mealItemsRepo: Repository<MealItem>,
    @InjectRepository(MealPlan)
    private readonly mealPlansRepo: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealsRepo: Repository<Meal>,
    @InjectRepository(UserProfile)
    private readonly profilesRepo: Repository<UserProfile>,
    @InjectRepository(UserPreference)
    private readonly preferencesRepo: Repository<UserPreference>,
    @InjectRepository(Allergy)
    private readonly allergiesRepo: Repository<Allergy>,
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    private readonly aiService: AiService,
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
      relations: ['mealPlan', 'meal'],
    });

    if (!item) {
      throw new NotFoundException('Meal item not found');
    }

    if (item.mealPlan?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this meal item');
    }

    return item;
  }

  /**
   * Generates tailored AI replacement alternatives for a specific meal item using user profile, preferences & past feedbacks
   */
  async getAlternatives(userId: string, mealItemId: string) {
    const currentItem = await this.mealItemsRepo.findOne({
      where: { id: mealItemId },
      relations: ['mealPlan', 'meal'],
    });

    if (!currentItem) {
      throw new NotFoundException('Meal item not found');
    }

    if (currentItem.mealPlan?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this meal item');
    }

    const [userProfile, userPref, allergies, recentFeedbacks] = await Promise.all([
      this.profilesRepo.findOne({ where: { userId } }),
      this.preferencesRepo.findOne({ where: { userId } }),
      this.allergiesRepo.find({ where: { userId } }),
      this.feedbackRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    const currentSnapshot: any = currentItem.generatedMealSnapshot || currentItem.meal || {};

    const aiResult = await this.aiService.generateMealAlternatives({
      currentMeal: {
        name: currentSnapshot.name || 'Current Meal',
        mealType: currentItem.mealType,
        calories: Math.round(Number(currentItem.caloriesSnapshot || 500)),
        protein: Math.round(Number(currentItem.proteinSnapshot || 25)),
        carbs: Math.round(Number(currentItem.carbsSnapshot || 50)),
        fat: Math.round(Number(currentItem.fatSnapshot || 15)),
        estimatedCostLkr: currentItem.estimatedCostSnapshot ? Number(currentItem.estimatedCostSnapshot) : undefined,
      },
      userProfile: {
        age: userProfile?.dateOfBirth ? this.calculateAge(userProfile.dateOfBirth) : undefined,
        biologicalSex: userProfile?.biologicalSex,
        goal: userProfile?.goal,
        activityLevel: userProfile?.activityLevel,
        dailyCalorieTarget: userPref?.dailyCalorieTarget ? Number(userPref.dailyCalorieTarget) : undefined,
      },
      userPreferences: {
        dietType: userPref?.dietType,
        preferredCuisines: userPref?.preferredCuisines || [],
        excludedIngredients: userPref?.excludedIngredients || [],
        dislikedFoods: userPref?.dislikedFoods || [],
        dailyBudget: userPref?.dailyBudget ? Number(userPref.dailyBudget) : undefined,
      },
      allergies: allergies.map((a) => a.allergen),
      recentFeedbacks: recentFeedbacks.map((f) => ({
        mealName: f.mealName || undefined,
        liked: f.liked != null ? f.liked : undefined,
        rating: f.rating != null ? f.rating : undefined,
        reasonTags: f.reasonTags || [],
        comment: f.comment || undefined,
      })),
    });

    return {
      currentMeal: {
        id: currentItem.id,
        name: currentSnapshot.name || 'Current Meal',
        type: currentItem.mealType.charAt(0).toUpperCase() + currentItem.mealType.slice(1),
        calories: Math.round(Number(currentItem.caloriesSnapshot || 520)),
        protein: Math.round(Number(currentItem.proteinSnapshot || 30)),
        carbs: Math.round(Number(currentItem.carbsSnapshot || 50)),
        fat: Math.round(Number(currentItem.fatSnapshot || 15)),
        estimatedCost: currentItem.estimatedCostSnapshot ? Number(currentItem.estimatedCostSnapshot) : null,
        reason: 'Higher in calories than your remaining budget.',
      },
      alternatives: aiResult.alternatives,
      modelUsed: aiResult.model,
      provider: aiResult.provider,
    };
  }

  /**
   * Replaces a meal item with a chosen alternative, updating plan statistics and DB
   */
  async replaceMealItem(
    userId: string,
    mealItemId: string,
    dto: ReplaceMealItemDto,
  ) {
    const originalItem = await this.mealItemsRepo.findOne({
      where: { id: mealItemId },
      relations: ['mealPlan'],
    });

    if (!originalItem) {
      throw new NotFoundException('Meal item not found');
    }

    if (originalItem.mealPlan?.userId !== userId) {
      throw new ForbiddenException('You do not have access to this meal item');
    }

    // Mark original item as replaced
    originalItem.status = 'replaced';
    await this.mealItemsRepo.save(originalItem);

    // Create the replacement item pointing to replacesMealItemId
    const newItem = this.mealItemsRepo.create({
      mealPlanId: originalItem.mealPlanId,
      day: originalItem.day,
      mealType: originalItem.mealType,
      replacesMealItemId: originalItem.id,
      status: 'scheduled',
      servings: 1,
      caloriesSnapshot: dto.calories,
      proteinSnapshot: dto.protein ?? 25,
      carbsSnapshot: dto.carbs ?? 45,
      fatSnapshot: dto.fat ?? 12,
      estimatedCostSnapshot: dto.budgetLkr ?? 180,
      nutritionVerificationStatus: 'verified',
      selectionExplanation: {
        reason: dto.reason || 'Replaced by user selection from AI alternatives',
        previousMealId: originalItem.id,
      },
      generatedMealSnapshot: {
        name: dto.name,
        mealType: originalItem.mealType,
        description: `AI-replaced meal: ${dto.name}`,
        calories: dto.calories,
        protein: dto.protein ?? 25,
        carbs: dto.carbs ?? 45,
        fat: dto.fat ?? 12,
        estimatedCostLkr: dto.budgetLkr ?? 180,
        ingredients: dto.ingredients ?? [],
        instructions: dto.instructions ?? [],
        dietTags: dto.tags ?? [],
      },
    });

    const savedNewItem = await this.mealItemsRepo.save(newItem);

    // Recalculate parent MealPlan totals with all active items
    const allActiveItems = await this.mealItemsRepo.find({
      where: {
        mealPlanId: originalItem.mealPlanId,
      },
    });

    const nonReplacedItems = allActiveItems.filter((it) => it.status !== 'replaced');
    const totalCals = nonReplacedItems.reduce(
      (sum, it) => sum + Number(it.caloriesSnapshot || 0),
      0,
    );
    const totalProt = nonReplacedItems.reduce(
      (sum, it) => sum + Number(it.proteinSnapshot || 0),
      0,
    );
    const totalCarbs = nonReplacedItems.reduce(
      (sum, it) => sum + Number(it.carbsSnapshot || 0),
      0,
    );
    const totalFat = nonReplacedItems.reduce(
      (sum, it) => sum + Number(it.fatSnapshot || 0),
      0,
    );
    const totalCost = nonReplacedItems.reduce(
      (sum, it) => sum + Number(it.estimatedCostSnapshot || 0),
      0,
    );

    await this.mealPlansRepo.update(originalItem.mealPlanId, {
      totalCalories: totalCals,
      totalProtein: totalProt,
      totalCarbs: totalCarbs,
      totalFat: totalFat,
      estimatedCostLkr: totalCost,
    });

    return {
      success: true,
      message: 'Meal replaced successfully',
      replacedItemId: originalItem.id,
      newItem: savedNewItem,
    };
  }

  private calculateAge(dateOfBirth: string): number {
    const birth = new Date(`${dateOfBirth}T00:00:00Z`);
    const today = new Date();
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    if (
      today.getUTCMonth() < birth.getUTCMonth() ||
      (today.getUTCMonth() === birth.getUTCMonth() &&
        today.getUTCDate() < birth.getUTCDate())
    ) {
      age--;
    }
    return age;
  }
}
