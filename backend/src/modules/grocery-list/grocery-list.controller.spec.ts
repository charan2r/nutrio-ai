import { Test, TestingModule } from '@nestjs/testing';
import { GroceryListController } from './grocery-list.controller';
import { GroceryListService } from './grocery-list.service';

describe('GroceryListController', () => {
  let controller: GroceryListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroceryListController],
      providers: [GroceryListService],
    }).compile();

    controller = module.get<GroceryListController>(GroceryListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
