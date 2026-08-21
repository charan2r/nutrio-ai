/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  Injectable,
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
  constructor(private readonly config: ConfigService) {}

  async generateMealPlan(
    context: MealPlanGenerationContext,
  ): Promise<{ plan: GeneratedMealPlan; model: string; attempts: number }> {
    const model = this.config.get<string>('GROQ_MODEL', 'openai/gpt-oss-120b');
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return {
          plan: this.parseAndValidate(
            await this.requestGroq(this.buildPrompt(context), model),
            context,
          ),
          model,
          attempts: attempt,
        };
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error('Unknown AI generation error');
      }
    }
    if (lastError instanceof ServiceUnavailableException) throw lastError;
    throw new BadGatewayException(
      'Meal plan generation returned an invalid response after one retry',
    );
  }

  private async requestGroq(prompt: string, model: string) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (!apiKey)
      throw new ServiceUnavailableException(
        'Meal plan generation is not configured',
      );
    let response: Response;
    try {
      response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [{ role: 'user', content: prompt }],
          }),
        },
      );
    } catch {
      throw new BadGatewayException(
        'Could not reach the meal generation provider',
      );
    }
    if (!response.ok)
      throw new BadGatewayException('Meal generation provider request failed');
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content)
      throw new BadGatewayException(
        'Meal generation provider returned no content',
      );
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
Generate exactly ${context.durationDays} days, numbered 1 through ${context.durationDays}; each has exactly ${context.mealsPerDay} meals.
Avoid allergies, exclusions and dislikes; respect diet, LKR budget and prep limit where provided.
Required schema: {"days":[{"day":1,"meals":[{"mealId":null,"mealType":"breakfast|lunch|dinner|snack","name":"string","description":"string","ingredients":[{"name":"string","quantity":1,"unit":"string"}],"servings":1,"calories":0,"protein":0,"carbs":0,"fat":0,"estimatedCostLkr":0,"prepTimeMinutes":1,"allergens":["string"],"dietTags":["string"],"reason":"string"}]}]}`;
  }

  private parseAndValidate(
    content: string,
    context: MealPlanGenerationContext,
  ): GeneratedMealPlan {
    let value: unknown;
    try {
      value = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
      throw new Error('Response was not JSON');
    }
    if (
      !isObject(value) ||
      !Array.isArray(value.days) ||
      value.days.length !== context.durationDays
    )
      throw new Error('Invalid days');
    const days = new Set<number>();
    for (const day of value.days) {
      if (
        !isObject(day) ||
        !positiveInt(day.day) ||
        day.day > context.durationDays ||
        days.has(day.day) ||
        !Array.isArray(day.meals) ||
        day.meals.length !== context.mealsPerDay
      )
        throw new Error('Invalid day');
      days.add(day.day);
      const types = new Set<string>();
      for (const meal of day.meals) {
        if (!validMeal(meal) || types.has(meal.mealType))
          throw new Error('Invalid meal');
        types.add(meal.mealType);
      }
    }
    return value as GeneratedMealPlan;
  }
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function string(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function number(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
function positiveInt(value: unknown): value is number {
  return number(value) && Number.isInteger(value) && value > 0;
}
function validMeal(value: unknown): value is Meal {
  if (
    !isObject(value) ||
    !['breakfast', 'lunch', 'dinner', 'snack'].includes(
      value.mealType as string,
    ) ||
    !string(value.name) ||
    !string(value.description) ||
    !positiveInt(value.servings) ||
    !string(value.reason) ||
    !Array.isArray(value.ingredients) ||
    !Array.isArray(value.allergens) ||
    !Array.isArray(value.dietTags)
  )
    return false;
  if (
    value.mealId !== undefined &&
    value.mealId !== null &&
    !string(value.mealId)
  ) {
    return false;
  }
  if (
    !['calories', 'protein', 'carbs', 'fat'].every(
      (key) => number(value[key]) && (value[key] as number) >= 0,
    )
  )
    return false;
  if (
    value.estimatedCostLkr !== undefined &&
    (!number(value.estimatedCostLkr) || value.estimatedCostLkr < 0)
  )
    return false;
  if (
    value.prepTimeMinutes !== undefined &&
    !positiveInt(value.prepTimeMinutes)
  )
    return false;
  return (
    value.ingredients.every(
      (item) =>
        isObject(item) &&
        string(item.name) &&
        number(item.quantity) &&
        item.quantity > 0 &&
        string(item.unit),
    ) &&
    value.allergens.every(string) &&
    value.dietTags.every(string)
  );
}
