import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './login';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
