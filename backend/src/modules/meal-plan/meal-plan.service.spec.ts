import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MealPlanService } from './meal-plan.service';
import { UserProfile } from '../profile/entities/profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { Allergy } from '../allergy/entities/allergy.entity';
import { MealPlanRequest } from '../meal-plan-request/entities/meal-plan-request.entity';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from '../meal/entities/meal.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { AiService } from '../ai/ai.service';
import { MealPlanValidationService } from '../validation/meal-plan-validation.service';
import { GroceryListService } from '../grocery-list/grocery-list.service';

describe('MealPlanService (TC-4 & TC-5: Plan & 9 MealItems Creation)', () => {
  let service: MealPlanService;

  const mockProfileRepo = {
    findOneBy: jest.fn().mockResolvedValue({
      userId: 'user-123',
      dateOfBirth: '1995-05-15',
      biologicalSex: 'male',
      heightCm: 175,
      weightKg: 70,
      goal: 'maintain',
      activityLevel: 'moderately_active',
    }),
  };

  const mockPreferenceRepo = {
    findOneBy: jest.fn().mockResolvedValue({
      userId: 'user-123',
      dailyCalorieTarget: 2000,
      dietType: 'vegetarian',
      appetiteLevel: 'medium',
      mealsPerDay: 3,
      dailyBudget: 1500,
      preferredCuisines: ['Sri Lankan'],
      excludedIngredients: [],
      dislikedFoods: [],
      maximumPrepMinutes: 30,
      cookingSkill: 'intermediate',
      servings: 1,
    }),
  };

  const mockAllergyRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockRequestsRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) =>
      Promise.resolve({ id: 'request-uuid-1', ...entity }),
    ),
  };

  const mockMealPlanRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) =>
      Promise.resolve({ id: 'plan-uuid-1', ...entity }),
    ),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMealsRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockFeedbackRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockAiService = {
    generateMealPlan: jest.fn().mockResolvedValue({
      plan: {
        days: [
          {
            day: 1,
            meals: [
              { mealType: 'breakfast', name: 'Meal 1', calories: 400, protein: 15, carbs: 60, fat: 10, ingredients: [] },
              { mealType: 'lunch', name: 'Meal 2', calories: 700, protein: 30, carbs: 90, fat: 15, ingredients: [] },
              { mealType: 'dinner', name: 'Meal 3', calories: 500, protein: 20, carbs: 70, fat: 12, ingredients: [] },
            ],
          },
          {
            day: 2,
            meals: [
              { mealType: 'breakfast', name: 'Meal 4', calories: 400, protein: 15, carbs: 60, fat: 10, ingredients: [] },
              { mealType: 'lunch', name: 'Meal 5', calories: 700, protein: 30, carbs: 90, fat: 15, ingredients: [] },
              { mealType: 'dinner', name: 'Meal 6', calories: 500, protein: 20, carbs: 70, fat: 12, ingredients: [] },
            ],
          },
          {
            day: 3,
            meals: [
              { mealType: 'breakfast', name: 'Meal 7', calories: 400, protein: 15, carbs: 60, fat: 10, ingredients: [] },
              { mealType: 'lunch', name: 'Meal 8', calories: 700, protein: 30, carbs: 90, fat: 15, ingredients: [] },
              { mealType: 'dinner', name: 'Meal 9', calories: 500, protein: 20, carbs: 70, fat: 12, ingredients: [] },
            ],
          },
        ],
      },
      model: 'gemini-3.5-flash-lite',
      provider: 'gemini',
      attempts: 1,
    }),
  };

  const mockValidationService = {
    validatePlan: jest.fn().mockReturnValue({
      isValid: true,
      qualityScore: 92,
      scoreBreakdown: { nutrition: 95, constraints: 100, preferences: 90, budget: 90, diversity: 85 },
      validationSummary: {
        structureValid: true,
        allergySafe: true,
        dietCompliant: true,
        calorieTargetMet: true,
        budgetMet: true,
        prepTimeMet: true,
        diversityAcceptable: true,
        strictCalorieVerified: true,
        safetyValidated: true,
      },
      details: {},
    }),
  };

  const mockGroceryListService = {
    generateForPlan: jest.fn().mockResolvedValue({
      id: 'grocery-uuid-1',
      items: [],
      estimatedTotalCostLkr: 1200,
    }),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback) => {
      const manager = {
        getRepository: (entity: any) => {
          if (entity === MealPlan) return mockMealPlanRepo;
          return {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((items) =>
              Array.isArray(items)
                ? Promise.resolve(items.map((it, idx) => ({ id: `item-uuid-${idx + 1}`, ...it })))
                : Promise.resolve({ id: 'item-uuid-1', ...items }),
            ),
          };
        },
      };
      return callback(manager);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlanService,
        { provide: getRepositoryToken(UserProfile), useValue: mockProfileRepo },
        { provide: getRepositoryToken(UserPreference), useValue: mockPreferenceRepo },
        { provide: getRepositoryToken(Allergy), useValue: mockAllergyRepo },
        { provide: getRepositoryToken(MealPlanRequest), useValue: mockRequestsRepo },
        { provide: getRepositoryToken(MealPlan), useValue: mockMealPlanRepo },
        { provide: getRepositoryToken(Meal), useValue: mockMealsRepo },
        { provide: getRepositoryToken(Feedback), useValue: mockFeedbackRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AiService, useValue: mockAiService },
        { provide: MealPlanValidationService, useValue: mockValidationService },
        { provide: GroceryListService, useValue: mockGroceryListService },
      ],
    }).compile();

    service = module.get<MealPlanService>(MealPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateForUser (TC-4 & TC-5: 3 Days x 3 Meals = 9 Items Created)', () => {
    it('should generate plan with exactly 9 meal items and grocery list', async () => {
      const result = await service.generateForUser('user-123', {
        startDate: '2026-09-01',
        durationDays: 3,
        strictCalorieControl: false,
      });

      expect(result).toBeDefined();
      expect(result.planId).toBe('plan-uuid-1');
      expect(result.items).toHaveLength(9); // 3 days * 3 meals = 9 items
      expect(result.groceryList).toBeDefined();
      expect(result.validation.safetyValidated).toBe(true);
      expect(result.qualityScore).toBe(92);
      expect(mockRequestsRepo.save).toHaveBeenCalled();
      expect(mockGroceryListService.generateForPlan).toHaveBeenCalled();
    });
  });
});
