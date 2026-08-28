import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { MealPlanGenerationContext } from '../meal-plan/meal-plan.service';

describe('AiService (TC-4: Duration & TC-6: Schema Resilience)', () => {
  let service: AiService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      if (key === 'GEMINI_API_KEY') return 'mock-gemini-key';
      if (key === 'GEMINI_MODEL') return 'gemini-3.5-flash-lite';
      return defaultValue;
    }),
  };

  const sampleContext: MealPlanGenerationContext = {
    age: 25,
    biologicalSex: 'female',
    heightCm: 165,
    weightKg: 58,
    goal: 'weight_gain',
    activityLevel: 'sedentary',
    dailyCalorieTarget: 1800,
    dietType: 'vegetarian',
    appetiteLevel: 'medium',
    mealsPerDay: 3,
    dailyBudget: 1200,
    preferredCuisines: ['Sri Lankan'],
    excludedIngredients: [],
    dislikedFoods: [],
    maximumPrepMinutes: 30,
    cookingSkill: 'beginner',
    servings: 1,
    allergies: [],
    startDate: '2026-09-01',
    durationDays: 3,
    strictCalorieControl: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseAndValidate (TC-4: Duration Days Assertion)', () => {
    it('should correctly parse and assert exactly 3 days for 3-day request', () => {
      const validJsonOutput = JSON.stringify({
        days: [
          {
            day: 1,
            meals: [
              {
                mealType: 'breakfast',
                name: 'String Hoppers with Dhal',
                calories: 400,
                protein: 12,
                carbs: 65,
                fat: 10,
                ingredients: [{ name: 'String hoppers', quantity: 5, unit: 'pieces' }],
              },
              {
                mealType: 'lunch',
                name: 'Red Rice with Dhal & Gotukola',
                calories: 700,
                protein: 25,
                carbs: 100,
                fat: 15,
                ingredients: [{ name: 'Red rice', quantity: 150, unit: 'g' }],
              },
              {
                mealType: 'dinner',
                name: 'Pittu with Kiri Hodi',
                calories: 550,
                protein: 18,
                carbs: 80,
                fat: 12,
                ingredients: [{ name: 'Kurakkan pittu', quantity: 150, unit: 'g' }],
              },
            ],
          },
          {
            day: 2,
            meals: [
              { mealType: 'breakfast', name: 'Pol Roti', calories: 420, protein: 10, carbs: 60, fat: 14, ingredients: [{ name: 'Flour', quantity: 100, unit: 'g' }] },
              { mealType: 'lunch', name: 'Rice & Curry', calories: 750, protein: 28, carbs: 105, fat: 16, ingredients: [{ name: 'Rice', quantity: 150, unit: 'g' }] },
              { mealType: 'dinner', name: 'Hoppers with Lunu Miris', calories: 500, protein: 12, carbs: 75, fat: 10, ingredients: [{ name: 'Hoppers', quantity: 3, unit: 'pieces' }] },
            ],
          },
          {
            day: 3,
            meals: [
              { mealType: 'breakfast', name: 'Oats Porridge with Kithul', calories: 380, protein: 14, carbs: 55, fat: 8, ingredients: [{ name: 'Oats', quantity: 60, unit: 'g' }] },
              { mealType: 'lunch', name: 'Red Rice & Soya Curry', calories: 720, protein: 30, carbs: 98, fat: 14, ingredients: [{ name: 'Soya', quantity: 100, unit: 'g' }] },
              { mealType: 'dinner', name: 'Vegetable Soup with Toast', calories: 480, protein: 16, carbs: 70, fat: 10, ingredients: [{ name: 'Bread', quantity: 2, unit: 'slices' }] },
            ],
          },
        ],
      });

      const parsed = (service as any).parseAndValidate(validJsonOutput, sampleContext);
      expect(parsed.days).toHaveLength(3);
      expect(parsed.days[0].meals).toHaveLength(3);
      expect(parsed.days[1].meals).toHaveLength(3);
      expect(parsed.days[2].meals).toHaveLength(3);
    });
  });

  describe('parseAndValidate (TC-6: Invalid Schema Rejection & Error Handling)', () => {
    it('should throw Error when JSON is malformed or invalid format', () => {
      const invalidJson = 'Not a valid json string { random text }';

      expect(() => {
        (service as any).parseAndValidate(invalidJson, sampleContext);
      }).toThrow();
    });

    it('should throw Error when days array is missing or empty', () => {
      const emptySchema = JSON.stringify({ randomKey: 'no days array' });

      expect(() => {
        (service as any).parseAndValidate(emptySchema, sampleContext);
      }).toThrow('Invalid schema: Missing days array');
    });
  });
});
