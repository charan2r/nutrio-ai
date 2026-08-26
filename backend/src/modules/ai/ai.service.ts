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

export type MealAlternativeContext = {
  currentMeal: {
    name: string;
    mealType: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    estimatedCostLkr?: number;
  };
  userProfile: {
    age?: number;
    biologicalSex?: string;
    goal?: string;
    activityLevel?: string;
    dailyCalorieTarget?: number;
  };
  userPreferences: {
    dietType?: string;
    preferredCuisines?: string[];
    excludedIngredients?: string[];
    dislikedFoods?: string[];
    dailyBudget?: number;
  };
  allergies: string[];
  recentFeedbacks?: Array<{
    mealName?: string;
    liked?: boolean;
    rating?: number;
    reasonTags?: string[];
    comment?: string;
  }>;
};

export type GeneratedMealAlternative = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  budgetLkr: number;
  tags: string[];
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  instructions: string[];
  bestMatch: boolean;
  reason: string;
};

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

  /**
   * Generates tailored AI replacement meal alternatives based on user profile, preferences & past feedback
   */
  async generateMealAlternatives(
    context: MealAlternativeContext,
  ): Promise<{ alternatives: GeneratedMealAlternative[]; model: string; provider: string }> {
    const geminiKey = this.config.get<string>('GEMINI_API_KEY');

    if (!geminiKey) {
      throw new ServiceUnavailableException('Gemini API key is not configured');
    }

    const geminiModel = this.config.get<string>('GEMINI_MODEL', 'gemini-3.5-flash-lite');
    const prompt = this.buildAlternativePrompt(context);

    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const raw = await this.requestGemini(prompt, geminiModel, geminiKey);
        const alternatives = this.parseAlternativeResponse(raw, context);
        if (alternatives.length > 0) {
          return {
            alternatives,
            model: geminiModel,
            provider: 'gemini',
          };
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Gemini alternative generation attempt ${attempt} failed: ${lastError.message}`);
      }
    }

    throw new BadGatewayException(`Alternative meal generation failed: ${lastError?.message || 'Unknown error'}`);
  }

  private buildAlternativePrompt(context: MealAlternativeContext): string {
    const { currentMeal, userProfile, userPreferences, allergies, recentFeedbacks } = context;

    let feedbackSummary = 'None';
    if (recentFeedbacks && recentFeedbacks.length > 0) {
      feedbackSummary = recentFeedbacks
        .map(
          (f) =>
            `- Meal: "${f.mealName || 'Dish'}", Liked: ${f.liked ? 'Yes' : 'No'}, Rating: ${f.rating || 'N/A'}/5, Issues: [${(f.reasonTags || []).join(', ')}], Note: "${f.comment || ''}"`,
        )
        .join('\n');
    }

    return `You are an expert clinical dietitian and Sri Lankan nutrition specialist.
A user wants to replace their current ${currentMeal.mealType} dish: "${currentMeal.name}" (${currentMeal.calories} kcal).

USER PROFILE & CONSTRAINTS:
- Goal: ${userProfile.goal || 'Healthy Living'}
- Diet Type: ${userPreferences.dietType || 'Balanced'}
- Daily Calorie Target: ${userProfile.dailyCalorieTarget || 2000} kcal
- Daily Budget: LKR ${userPreferences.dailyBudget || 700}
- Allergies / Strict Avoidance: [${allergies.join(', ') || 'None'}]
- Excluded Ingredients: [${(userPreferences.excludedIngredients || []).join(', ') || 'None'}]
- Disliked Foods: [${(userPreferences.dislikedFoods || []).join(', ') || 'None'}]
- Preferred Cuisines / Flavors: [${(userPreferences.preferredCuisines || []).join(', ') || 'Sri Lankan, Healthy'}]

USER HISTORICAL FEEDBACK & PREFERENCES:
${feedbackSummary}

TASK:
Generate exactly 3 DISTINCT, healthier, practical Sri Lankan / healthy fusion alternative meals for this ${currentMeal.mealType}.
- Each alternative must respect all allergies, dislikes, and feedback (e.g. if user complained about too spicy, make dishes mild; if too expensive, keep cost low).
- Alternative 1 should be the "Best Match" (optimal macro balance and goal alignment).
- Alternative 2 should offer a distinct protein/carb twist (e.g. high protein plant-based or lean poultry).
- Alternative 3 should be high in fiber and cost-effective.

Return ONLY valid JSON matching this exact structure with no markdown or formatting outside the JSON:
{
  "alternatives": [
    {
      "name": "Dish Name",
      "calories": 420,
      "protein": 28,
      "carbs": 45,
      "fat": 12,
      "budgetLkr": 180,
      "tags": ["High Protein", "Gluten Free"],
      "ingredients": [
        { "name": "Ingredient 1", "quantity": 100, "unit": "g" },
        { "name": "Ingredient 2", "quantity": 1, "unit": "cup" }
      ],
      "instructions": [
        "Step 1...",
        "Step 2..."
      ],
      "bestMatch": true,
      "reason": "Clear explanation of why this is a superior replacement for the user's goal"
    }
  ]
}`;
  }

  private parseAlternativeResponse(
    raw: string,
    context: MealAlternativeContext,
  ): GeneratedMealAlternative[] {
    let parsed: any;
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*|```$/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return [];
    }

    const items = Array.isArray(parsed?.alternatives) ? parsed.alternatives : [];
    return items.slice(0, 3).map((alt: any, idx: number) => ({
      id: `ai-alt-${idx + 1}`,
      name: String(alt.name || 'Nutritious Bowl'),
      calories: Math.max(200, Math.round(Number(alt.calories) || 400)),
      protein: Math.max(5, Math.round(Number(alt.protein) || 25)),
      carbs: Math.max(10, Math.round(Number(alt.carbs) || 45)),
      fat: Math.max(2, Math.round(Number(alt.fat) || 12)),
      budgetLkr: Math.max(50, Math.round(Number(alt.budgetLkr) || 180)),
      tags: Array.isArray(alt.tags) && alt.tags.length > 0 ? alt.tags.map(String) : ['High Protein', 'Balanced'],
      ingredients: Array.isArray(alt.ingredients)
        ? alt.ingredients.map((ing: any) => ({
            name: String(ing.name || 'Ingredient'),
            quantity: Number(ing.quantity) || 1,
            unit: String(ing.unit || 'g'),
          }))
        : [{ name: 'Fresh Ingredients', quantity: 1, unit: 'portion' }],
      instructions: Array.isArray(alt.instructions)
        ? alt.instructions.map(String)
        : ['Rinse and prepare ingredients.', 'Cook in pan with light tempering spices.', 'Serve fresh and warm.'],
      bestMatch: idx === 0 || Boolean(alt.bestMatch),
      reason: String(alt.reason || 'Optimal nutrition density fitting your calorie budget.'),
    }));
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
            temperature: 0.3,
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

  /**
   * Generates tailored AI meal plans
   */
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
