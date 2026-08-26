/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MealPlanGenerationContext } from '../meal-plan/meal-plan.service';

type Ingredient = { name: string; quantity: number; unit: string };
export type Meal = {
  mealId?: string | null;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions?: string[];
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedCostLkr?: number;
  prepTimeMinutes?: number;
  allergens: string[];
  dietTags: string[];
  reason: string;
};
export type GeneratedMealPlan = { days: { day: number; meals: Meal[] }[] };

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  async generateMealPlan(
    context: MealPlanGenerationContext,
  ): Promise<{ plan: GeneratedMealPlan; model: string; provider: string; attempts: number }> {
    const geminiKey = this.config.get<string>('GEMINI_API_KEY');

    if (!geminiKey) {
      throw new ServiceUnavailableException('Gemini API key is not configured');
    }

    const geminiModel = this.config.get<string>('GEMINI_MODEL', 'gemini-3.5-flash-lite');
    const prompt = this.buildPrompt(context);

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const raw = await this.requestGemini(prompt, geminiModel, geminiKey);
        const plan = this.parseAndValidate(raw, context);
        return {
          plan,
          model: geminiModel,
          provider: 'gemini',
          attempts: attempt,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Gemini attempt ${attempt} failed: ${lastError.message}`);
      }
    }

    throw new BadGatewayException(`Meal plan generation failed: ${lastError?.message || 'Unknown error'}`);
  }

  private async requestGemini(prompt: string, model: string, apiKey: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });
    } catch (err) {
      throw new BadGatewayException(`Could not reach Gemini API: ${err.message}`);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new BadGatewayException(`Gemini API error ${response.status}: ${errText}`);
    }

    const payload = (await response.json()) as any;
    const content = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new BadGatewayException('Gemini returned an empty response');
    }
    return content;
  }

  private buildPrompt(context: MealPlanGenerationContext) {
    let verifiedMealsSection = '';
    if (context.verifiedMeals && context.verifiedMeals.length > 0) {
      verifiedMealsSection = `\nAvailable verified database meals:
${context.verifiedMeals
  .map(
    (m) =>
      `- ID: "${m.id}", Name: "${m.name}", MealType: "${m.mealType}", Calories: ${m.calories}kcal, Protein: ${m.protein}g, Carbs: ${m.carbs}g, Fat: ${m.fat}g, Cost: LKR ${m.estimatedCostLkr ?? 0}`,
  )
  .join('\n')}
Prefer these verified meals where suitable by setting "mealId" to the meal's ID string and matching its nutrition/ingredients. Set "mealId": null if generating a novel meal.\n`;
    }

    let feedbackSection = '';
    if (context.userFeedback) {
      const { likedMeals, dislikedMeals, feedbackNotes } = context.userFeedback;
      const parts: string[] = [];
      if (likedMeals && likedMeals.length > 0) {
        parts.push(
          `- Highly rated / Liked dishes by user: ${likedMeals.join(', ')} (Incorporate similar flavors, textures, or recipe styles)`,
        );
      }
      if (dislikedMeals && dislikedMeals.length > 0) {
        parts.push(
          `- Disliked / Low-rated dishes by user: ${dislikedMeals.join(', ')} (STRICTLY DO NOT propose these meals or close variations)`,
        );
      }
      if (feedbackNotes && feedbackNotes.length > 0) {
        parts.push(
          `- Specific past user feedback & adjustments:\n  * ${feedbackNotes.slice(0, 10).join('\n  * ')}`,
        );
      }
      if (parts.length > 0) {
        feedbackSection = `\nUSER'S HISTORICAL MEAL FEEDBACK & CONTINUOUS PERSONALIZATION:\n${parts.join('\n')}\n`;
      }
    }

    const mealTypes =
      context.mealsPerDay === 4
        ? ['breakfast', 'lunch', 'snack', 'dinner']
        : ['breakfast', 'lunch', 'dinner'];

    return `Generate a Sri Lankan meal plan. Return JSON only, with no markdown.
Context: ${JSON.stringify({
      age: context.age,
      biologicalSex: context.biologicalSex,
      goal: context.goal,
      activityLevel: context.activityLevel,
      dailyCalorieTarget: context.dailyCalorieTarget,
      dietType: context.dietType,
      mealsPerDay: context.mealsPerDay,
      dailyBudget: context.dailyBudget,
      preferredCuisines: context.preferredCuisines,
      excludedIngredients: context.excludedIngredients,
      dislikedFoods: context.dislikedFoods,
      maximumPrepMinutes: context.maximumPrepMinutes,
      cookingSkill: context.cookingSkill,
      servings: context.servings,
      allergies: context.allergies,
      durationDays: context.durationDays,
    })}.
${verifiedMealsSection}
${feedbackSection}
VERY IMPORTANT REQUIREMENTS:
1. Generate an array "days" containing EXACTLY ${context.durationDays} days numbered 1 through ${context.durationDays}.
2. Each day MUST contain EXACTLY ${context.mealsPerDay} meals: ${mealTypes.join(', ')}.
3. Daily sum of meal calories must be close to target (${context.dailyCalorieTarget} kcal/day).
4. Avoid user allergies and exclusions; respect diet and budget constraints.
5. Keep descriptions, reasons, and ingredients concise.
6. Strictly honor user's historical feedback: never repeat disliked dishes, respect feedback notes on spice/prep-time/cost, and favor culinary profiles the user previously rated 4+ stars.

Required schema:
{"days":[{"day":1,"meals":[{"mealId":null,"mealType":"breakfast|lunch|dinner|snack","name":"string","description":"string","prepTimeMinutes":20,"instructions":["Step 1...","Step 2...","Step 3..."],"ingredients":[{"name":"string","quantity":100,"unit":"g"}],"servings":1,"calories":500,"protein":30,"carbs":50,"fat":15,"estimatedCostLkr":400,"allergens":["egg"],"dietTags":["high-protein"],"reason":"string"}]}]}`;
  }

  private parseAndValidate(
    content: string,
    context: MealPlanGenerationContext,
  ): GeneratedMealPlan {
    let value: any;
    try {
      value = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
      throw new Error('Response was not valid JSON');
    }

    const rawDays = Array.isArray(value)
      ? value
      : Array.isArray(value?.days)
        ? value.days
        : Array.isArray(value?.mealPlan)
          ? value.mealPlan
          : null;

    if (!rawDays || rawDays.length === 0) {
      throw new Error('Invalid schema: Missing days array');
    }

    const defaultMealTypes =
      context.mealsPerDay === 4
        ? ['breakfast', 'lunch', 'snack', 'dinner']
        : ['breakfast', 'lunch', 'dinner'];

    const daysResult = [];
    for (let d = 1; d <= context.durationDays; d++) {
      const rawDay =
        rawDays.find((item: any) => Number(item?.day) === d) ||
        rawDays[d - 1] ||
        rawDays[0];
      const rawMeals = Array.isArray(rawDay?.meals) ? rawDay.meals : [];

      const meals: Meal[] = [];
      for (let mIdx = 0; mIdx < context.mealsPerDay; mIdx++) {
        const rawMeal = rawMeals[mIdx] || rawMeals[0] || {};
        const declaredType = String(rawMeal.mealType || '').toLowerCase();
        const mealType = (['breakfast', 'lunch', 'dinner', 'snack'].includes(declaredType)
          ? declaredType
          : defaultMealTypes[mIdx] || 'lunch') as Meal['mealType'];

        const ingredients =
          Array.isArray(rawMeal.ingredients) && rawMeal.ingredients.length > 0
            ? rawMeal.ingredients.map((ing: any) => ({
                name: String(ing?.name || 'Ingredient'),
                quantity: Number(ing?.quantity) > 0 ? Number(ing.quantity) : 1,
                unit: String(ing?.unit || 'item'),
              }))
            : [{ name: 'Rice & Curry Ingredients', quantity: 1, unit: 'portion' }];

        const instructions =
          Array.isArray(rawMeal.instructions) && rawMeal.instructions.length > 0
            ? rawMeal.instructions.map((s: any) => String(s).trim()).filter(Boolean)
            : typeof rawMeal.recipe === 'string' && rawMeal.recipe.trim()
              ? rawMeal.recipe
                  .split('\n')
                  .map((s: string) => s.replace(/^\d+[\.\)]\s*/, '').trim())
                  .filter(Boolean)
              : [
                  `Rinse and prepare ingredients for ${rawMeal.name || 'this meal'}.`,
                  `Heat pan or pot with a small amount of oil, temper spices and aromatics.`,
                  `Combine main ingredients and simmer gently until cooked thoroughly.`,
                  `Season to taste and serve warm with accompanying dishes.`,
                ];

        meals.push({
          mealId:
            typeof rawMeal.mealId === 'string' && rawMeal.mealId.trim()
              ? rawMeal.mealId.trim()
              : null,
          mealType,
          name: String(rawMeal.name || 'Sri Lankan Meal'),
          description: String(rawMeal.description || rawMeal.name || 'Nutritious meal'),
          ingredients,
          instructions,
          servings: Number(rawMeal.servings) > 0 ? Math.round(Number(rawMeal.servings)) : 1,
          calories: Math.max(0, Math.round(Number(rawMeal.calories) || 500)),
          protein: Math.max(0, Math.round(Number(rawMeal.protein) || 25)),
          carbs: Math.max(0, Math.round(Number(rawMeal.carbs) || 60)),
          fat: Math.max(0, Math.round(Number(rawMeal.fat) || 15)),
          estimatedCostLkr:
            rawMeal.estimatedCostLkr != null
              ? Math.max(0, Math.round(Number(rawMeal.estimatedCostLkr)))
              : null,
          prepTimeMinutes:
            rawMeal.prepTimeMinutes != null
              ? Math.max(1, Math.round(Number(rawMeal.prepTimeMinutes)))
              : 20,
          allergens: Array.isArray(rawMeal.allergens) ? rawMeal.allergens.map(String) : [],
          dietTags: Array.isArray(rawMeal.dietTags) ? rawMeal.dietTags.map(String) : [],
          reason: String(rawMeal.reason || 'Nutritious balanced meal tailored to your goal'),
        });
      }

      daysResult.push({
        day: d,
        meals,
      });
    }

    return { days: daysResult };
  }
}
