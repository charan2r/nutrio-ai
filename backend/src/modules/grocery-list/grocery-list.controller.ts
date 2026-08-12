import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GroceryListService } from './grocery-list.service';
import { CreateGroceryListDto } from './dto/create-grocery-list.dto';
import { UpdateGroceryListDto } from './dto/update-grocery-list.dto';

@Controller('grocery-list')
export class GroceryListController {
  constructor(private readonly groceryListService: GroceryListService) {}

  @Post()
  create(@Body() createGroceryListDto: CreateGroceryListDto) {
    return this.groceryListService.create(createGroceryListDto);
  }

  @Get()
  findAll() {
    return this.groceryListService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groceryListService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroceryListDto: UpdateGroceryListDto) {
    return this.groceryListService.update(+id, updateGroceryListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groceryListService.remove(+id);
  }
}
