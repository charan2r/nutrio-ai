import { Test, TestingModule } from '@nestjs/testing';
import { GroceryListService } from './grocery-list.service';

describe('GroceryListService', () => {
  let service: GroceryListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroceryListService],
    }).compile();

    service = module.get<GroceryListService>(GroceryListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
