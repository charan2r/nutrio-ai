/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { GeneratedMealPlan } from '../ai/ai.service';
import { MealPlanGenerationContext } from '../meal-plan/meal-plan.service';

export interface AllergyValidationResult {
  passed: boolean;
  conflicts: Array<{
    day: number;
    mealType: string;
    mealName: string;
    matchedAllergen: string;
  }>;
}

export interface DietValidationResult {
  passed: boolean;
  violations: Array<{
    day: number;
    mealType: string;
    mealName: string;
    reason: string;
  }>;
}

export interface CalorieValidationResult {
  passed: boolean;
  averageDailyCalories: number;
  targetCalories: number;
  averageDeviationPct: number;
  dailyTotals: number[];
  score: number;
}

export interface BudgetValidationResult {
  passed: boolean;
  averageDailyCost: number;
  targetBudget: number | null;
  overBudgetPct: number;
  score: number;
}

export interface PreferenceValidationResult {
  passed: boolean;
  exceededPrepTimeCount: number;
  dislikedFoodMatches: string[];
  score: number;
}

export interface DiversityValidationResult {
  passed: boolean;
  uniqueMealCount: number;
  totalMealCount: number;
  score: number;
}

export interface StrictCalorieValidationResult {
  passed: boolean;
  reason?: string;
}

export interface ValidationSummary {
  structureValid: boolean;
  allergySafe: boolean;
  dietCompliant: boolean;
  calorieTargetMet: boolean;
  budgetMet: boolean;
  prepTimeMet: boolean;
  diversityAcceptable: boolean;
  strictCalorieVerified: boolean;
  safetyValidated: boolean;
}

export interface QualityScoreBreakdown {
  nutrition: number;
  constraints: number;
  preferences: number;
  budget: number;
  diversity: number;
}

export interface FullPlanValidationResult {
  isValid: boolean;
  qualityScore: number;
  scoreBreakdown: QualityScoreBreakdown;
  validationSummary: ValidationSummary;
  details: {
    allergies: AllergyValidationResult;
    diet: DietValidationResult;
    calories: CalorieValidationResult;
    budget: BudgetValidationResult;
    preferences: PreferenceValidationResult;
    diversity: DiversityValidationResult;
    strictCalorie: StrictCalorieValidationResult;
  };
}

const NON_VEG_KEYWORDS = [
  'chicken',
  'beef',
  'pork',
  'mutton',
  'lamb',
  'fish',
  'seafood',
  'prawn',
  'shrimp',
  'crab',
  'tuna',
  'salmon',
  'meat',
  'sausage',
  'bacon',
  'squid',
  'cuttlefish',
  'anchovy',
  'sprats',
];

const NON_VEGAN_KEYWORDS = [
  ...NON_VEG_KEYWORDS,
  'milk',
  'egg',
  'eggs',
  'butter',
  'cheese',
  'ghee',
  'curd',
  'yogurt',
  'yoghurt',
  'paneer',
  'honey',
  'dairy',
  'cream',
];

@Injectable()
export class MealPlanValidationService {
  validatePlan(
    plan: GeneratedMealPlan,
    context: MealPlanGenerationContext,
  ): FullPlanValidationResult {
    const allergies = this.validateAllergies(plan, context);
    const diet = this.validateDiet(plan, context);
    const calories = this.validateCalories(plan, context);
    const budget = this.validateBudget(plan, context);
    const preferences = this.validatePreferences(plan, context);
    const diversity = this.validateDiversity(plan);
    const strictCalorie = this.validateStrictCalorieControl(plan, context);

    // Constraint score (Allergies + Diet + StrictCalorie)
    let constraintScore = 100;
    if (!allergies.passed) constraintScore -= 50;
    if (!diet.passed) constraintScore -= 30;
    if (!strictCalorie.passed) constraintScore -= 20;
    constraintScore = Math.max(0, constraintScore);

    const nutritionScore = calories.score;
    const preferenceScore = preferences.score;
    const budgetScore = budget.score;
    const diversityScore = diversity.score;

    // Quality score formula: Nutrition 30%, Constraints 30%, Preferences 15%, Budget 15%, Diversity 10%
    const qualityScore = Math.round(
      nutritionScore * 0.3 +
        constraintScore * 0.3 +
        preferenceScore * 0.15 +
        budgetScore * 0.15 +
        diversityScore * 0.1,
    );

    const isValid =
      allergies.passed &&
      diet.passed &&
      calories.passed &&
      budget.passed &&
      strictCalorie.passed;

    const validationSummary: ValidationSummary = {
      structureValid: true,
      allergySafe: allergies.passed,
      dietCompliant: diet.passed,
      calorieTargetMet: calories.passed,
      budgetMet: budget.passed,
      prepTimeMet: preferences.passed,
      diversityAcceptable: diversity.passed,
      strictCalorieVerified: strictCalorie.passed,
      safetyValidated: allergies.passed && diet.passed,
    };

    return {
      isValid,
      qualityScore,
      scoreBreakdown: {
        nutrition: nutritionScore,
        constraints: constraintScore,
        preferences: preferenceScore,
        budget: budgetScore,
        diversity: diversityScore,
      },
      validationSummary,
      details: {
        allergies,
        diet,
        calories,
        budget,
        preferences,
        diversity,
        strictCalorie,
      },
    };
  }

  validateAllergies(
    plan: GeneratedMealPlan,
    context: MealPlanGenerationContext,
  ): AllergyValidationResult {
    const userAllergens = [
      ...(context.allergies || []),
      ...(context.excludedIngredients || []),
    ].map((a) => a.toLowerCase().trim());

    if (userAllergens.length === 0) {
      return { passed: true, conflicts: [] };
    }

    const conflicts: AllergyValidationResult['conflicts'] = [];

    for (const day of plan.days) {
      for (const meal of day.meals) {
        const declaredAllergens = (meal.allergens || []).map((a) =>
          a.toLowerCase().trim(),
        );
        const ingredientNames = (meal.ingredients || []).map((i) =>
          i.name.toLowerCase().trim(),
        );
        const mealName = meal.name.toLowerCase();

        for (const allergen of userAllergens) {
          if (!allergen) continue;
          const hasDeclaredConflict = declaredAllergens.some(
            (da) => da.includes(allergen) || allergen.includes(da),
          );
          const hasIngredientConflict = ingredientNames.some(
            (inName) => inName.includes(allergen) || allergen.includes(inName),
          );
          const hasNameConflict = mealName.includes(allergen);

          if (hasDeclaredConflict || hasIngredientConflict || hasNameConflict) {
            conflicts.push({
              day: day.day,
              mealType: meal.mealType,
              mealName: meal.name,
              matchedAllergen: allergen,
            });
          }
        }
      }
    }

    return {
      passed: conflicts.length === 0,
      conflicts,
    };
  }

  validateDiet(
    plan: GeneratedMealPlan,
    context: MealPlanGenerationContext,
  ): DietValidationResult {
    const dietType = (context.dietType || 'non-veg').toLowerCase().trim();
    const violations: DietValidationResult['violations'] = [];

    if (dietType === 'non-veg' || dietType === 'other') {
      return { passed: true, violations: [] };
    }

    for (const day of plan.days) {
      for (const meal of day.meals) {
        const mealName = meal.name.toLowerCase();
        const ingredientsText = (meal.ingredients || [])
          .map((i) => i.name.toLowerCase())
          .join(' ');
        const tags = (meal.dietTags || []).map((t) => t.toLowerCase());

        if (dietType === 'vegetarian') {
          const hasMeat = NON_VEG_KEYWORDS.some(
            (kw) => mealName.includes(kw) || ingredientsText.includes(kw),
          );
          const taggedNonVeg = tags.includes('non-veg') || tags.includes('non-vegetarian');
          if (hasMeat || taggedNonVeg) {
            violations.push({
              day: day.day,
              mealType: meal.mealType,
              mealName: meal.name,
              reason: 'Contains non-vegetarian ingredients or tags',
            });
          }
        } else if (dietType === 'vegan') {
          const hasAnimalProduct = NON_VEGAN_KEYWORDS.some(
            (kw) => mealName.includes(kw) || ingredientsText.includes(kw),
          );
          const taggedNonVegan =
            tags.includes('non-veg') ||
            tags.includes('vegetarian') ||
            tags.includes('dairy');
          if (hasAnimalProduct || (taggedNonVegan && !tags.includes('vegan'))) {
            violations.push({
              day: day.day,
              mealType: meal.mealType,
              mealName: meal.name,
              reason: 'Contains non-vegan ingredients, animal products or tags',
            });
          }
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  validateCalories(
    plan: GeneratedMealPlan,
    context: MealPlanGenerationContext,
  ): CalorieValidationResult {
    const target = context.dailyCalorieTarget || 2000;
    const dailyTotals: number[] = [];

    for (const day of plan.days) {
      const dayTotal = day.meals.reduce(
        (sum, m) => sum + m.calories * (m.servings || 1),
        0,
      );
      dailyTotals.push(dayTotal);
    }

    const averageDailyCalories =
      dailyTotals.length > 0
        ? Math.round(
            dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length,
          )
        : 0;

    const averageDeviationPct =
      target > 0
        ? Math.round(
            (Math.abs(averageDailyCalories - target) / target) * 100 * 10,
          ) / 10
        : 0;

    // Nutrition scoring: 100 for <= 5% deviation, decreasing gracefully
    let score = 100;
    if (averageDeviationPct > 5) {
      score = Math.max(0, Math.round(100 - (averageDeviationPct - 5) * 4));
    }

    // Pass criteria: within 15% tolerance
    const passed = averageDeviationPct <= 15;

    return {
      passed,
      averageDailyCalories,
      targetCalories: target,
      averageDeviationPct,
      dailyTotals,
      score,
    };
  }

  validateBudget(
    plan: GeneratedMealPlan,
    context: MealPlanGenerationContext,
  ): BudgetValidationResult {
    const targetBudget = context.dailyBudget;
    if (!targetBudget || targetBudget <= 0) {
      return {
        passed: true,
        averageDailyCost: 0,
        targetBudget: null,
        overBudgetPct: 0,
        score: 100,
      };
    }

    const dailyCosts: number[] = [];
    for (const day of plan.days) {
      const dayCost = day.meals.reduce(
        (sum, m) => sum + (m.estimatedCostLkr || 0) * (m.servings || 1),
        0,
      );
      dailyCosts.push(dayCost);
    }

    const averageDailyCost =
      dailyCosts.length > 0
        ? Math.round(dailyCosts.reduce((a, b) => a + b, 0) / dailyCosts.length)
        : 0;

    const overBudgetAmount = averageDailyCost - targetBudget;
    const overBudgetPct =
      overBudgetAmount > 0
        ? Math.round((overBudgetAmount / targetBudget) * 100 * 10) / 10
        : 0;

    let score = 100;
    if (overBudgetPct > 0) {
      score = Math.max(0, Math.round(100 - overBudgetPct * 3));
    }

    // Budget pass criteria: within 10% over-budget or under budget
    const passed = overBudgetPct <= 10;

    return {
      passed,
      averageDailyCost,
      targetBudget,
      overBudgetPct,
      score,
    };
  }

  validatePreferences(
    plan: GeneratedMealPlan,
    context: MealPlanGenerationContext,
  ): PreferenceValidationResult {
    let prepTimeViolations = 0;
    const dislikedMatches: string[] = [];
    const maxPrep = context.maximumPrepMinutes;
    const disliked = (context.dislikedFoods || []).map((f) =>
      f.toLowerCase().trim(),
    );

    let totalMeals = 0;
    for (const day of plan.days) {
      for (const meal of day.meals) {
        totalMeals++;
        if (maxPrep && meal.prepTimeMinutes && meal.prepTimeMinutes > maxPrep) {
          prepTimeViolations++;
        }

        const mealText = `${meal.name} ${(meal.ingredients || []).map((i) => i.name).join(' ')}`.toLowerCase();
        for (const item of disliked) {
          if (item && mealText.includes(item)) {
            dislikedMatches.push(item);
          }
        }
      }
    }

    let score = 100;
    if (totalMeals > 0 && prepTimeViolations > 0) {
      score -= Math.round((prepTimeViolations / totalMeals) * 30);
    }
    if (dislikedMatches.length > 0) {
      score -= Math.min(30, dislikedMatches.length * 10);
    }

    score = Math.max(0, score);
    const passed = prepTimeViolations === 0 && dislikedMatches.length === 0;

    return {
      passed,
      exceededPrepTimeCount: prepTimeViolations,
      dislikedFoodMatches: Array.from(new Set(dislikedMatches)),
      score,
    };
  }

  validateDiversity(plan: GeneratedMealPlan): DiversityValidationResult {
    const mealNames = new Set<string>();
    const ingredientNames = new Set<string>();
    let totalMeals = 0;

    for (const day of plan.days) {
      for (const meal of day.meals) {
        totalMeals++;
        mealNames.add(meal.name.toLowerCase().trim());
        for (const ing of meal.ingredients || []) {
          ingredientNames.add(ing.name.toLowerCase().trim());
        }
      }
    }

    const uniqueMealCount = mealNames.size;
    const mealDiversityRatio = totalMeals > 0 ? uniqueMealCount / totalMeals : 1;

    // Score based on meal uniqueness and ingredient variety
    let score = Math.round(mealDiversityRatio * 80 + Math.min(20, ingredientNames.size * 2));
    score = Math.min(100, Math.max(0, score));

    // Passes if at least 60% of meals are unique across the plan
    const passed = mealDiversityRatio >= 0.5;

    return {
      passed,
      uniqueMealCount,
      totalMealCount: totalMeals,
      score,
    };
  }

  validateStrictCalorieControl(
    plan: GeneratedMealPlan,
    context: MealPlanGenerationContext,
  ): StrictCalorieValidationResult {
    if (!context.strictCalorieControl) {
      return { passed: true };
    }

    const unverifiedMeals: string[] = [];
    for (const day of plan.days) {
      for (const meal of day.meals) {
        if (!meal.mealId) {
          unverifiedMeals.push(meal.name);
        }
      }
    }

    if (unverifiedMeals.length > 0) {
      return {
        passed: false,
        reason: `Strict calorie control requires nutrition-verified database meals. ${unverifiedMeals.length} novel meal(s) cannot be strictly verified.`,
      };
    }

    return { passed: true };
  }
}
