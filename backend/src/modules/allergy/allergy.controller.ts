/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AllergyService } from './allergy.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Controller('allergy')
@UseGuards(AuthGuard)
export class AllergyController {
  constructor(private readonly allergyService: AllergyService) {}

  @Post()
  create(@Body() createAllergyDto: CreateAllergyDto) {
    return this.allergyService.create(createAllergyDto);
  }

  @Get()
  findAll() {
    return this.allergyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.allergyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAllergyDto: UpdateAllergyDto) {
    return this.allergyService.update(+id, updateAllergyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.allergyService.remove(+id);
  }
}
