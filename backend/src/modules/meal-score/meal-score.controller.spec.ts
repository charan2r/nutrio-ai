import { Test, TestingModule } from '@nestjs/testing';
import { MealScoreController } from './meal-score.controller';
import { MealScoreService } from './meal-score.service';

describe('MealScoreController', () => {
  let controller: MealScoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealScoreController],
      providers: [MealScoreService],
    }).compile();

    controller = module.get<MealScoreController>(MealScoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
