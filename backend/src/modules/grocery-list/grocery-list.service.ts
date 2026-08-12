import { Injectable } from '@nestjs/common';
import { CreateGroceryListDto } from './dto/create-grocery-list.dto';
import { UpdateGroceryListDto } from './dto/update-grocery-list.dto';

@Injectable()
export class GroceryListService {
  create(createGroceryListDto: CreateGroceryListDto) {
    return 'This action adds a new groceryList';
  }

  findAll() {
    return `This action returns all groceryList`;
  }

  findOne(id: number) {
    return `This action returns a #${id} groceryList`;
  }

  update(id: number, updateGroceryListDto: UpdateGroceryListDto) {
    return `This action updates a #${id} groceryList`;
  }

  remove(id: number) {
    return `This action removes a #${id} groceryList`;
  }
}
