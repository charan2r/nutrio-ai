import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MealItemsService } from './meal-items.service';
import { MealItem } from './entities/meal-item.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { Meal } from '../meal/entities/meal.entity';
import { UserProfile } from '../profile/entities/profile.entity';
import { UserPreference } from '../user-preferences/entities/user-preference.entity';
import { Allergy } from '../allergy/entities/allergy.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { AiService } from '../ai/ai.service';

describe('MealItemsService', () => {
  let service: MealItemsService;

  const mockRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'item-1', ...entity })),
  };

  const mockAiService = {
    generateMealAlternatives: jest.fn().mockResolvedValue({ alternatives: [] }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealItemsService,
        { provide: getRepositoryToken(MealItem), useValue: mockRepo },
        { provide: getRepositoryToken(MealPlan), useValue: mockRepo },
        { provide: getRepositoryToken(Meal), useValue: mockRepo },
        { provide: getRepositoryToken(UserProfile), useValue: mockRepo },
        { provide: getRepositoryToken(UserPreference), useValue: mockRepo },
        { provide: getRepositoryToken(Allergy), useValue: mockRepo },
        { provide: getRepositoryToken(Feedback), useValue: mockRepo },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<MealItemsService>(MealItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
