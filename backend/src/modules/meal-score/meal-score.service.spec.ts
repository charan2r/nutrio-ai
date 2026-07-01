import { Test, TestingModule } from '@nestjs/testing';
import { MealScoreService } from './meal-score.service';

describe('MealScoreService', () => {
  let service: MealScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealScoreService],
    }).compile();

    service = module.get<MealScoreService>(MealScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
