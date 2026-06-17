import { Test, TestingModule } from '@nestjs/testing';
import { AllergyController } from './allergy.controller';
import { AllergyService } from './allergy.service';

describe('AllergyController', () => {
  let controller: AllergyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AllergyController],
      providers: [AllergyService],
    }).compile();

    controller = module.get<AllergyController>(AllergyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
