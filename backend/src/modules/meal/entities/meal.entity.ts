import { MealItem } from '../../meal-items/entities/meal-item.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  mealType: 'breakfast' | 'lunch' | 'dinner';

  @Column('float')
  calories: number;

  @Column('float')
  protein: number;

  @Column('float')
  carbs: number;

  @Column('float')
  fat: number;

  // Constraint system fields
  @Column('text', { array: true })
  allergens: string[];

  @Column({ default: false })
  isVegetarian: boolean;

  @Column()
  cuisineType: string;

  @Column('float', { nullable: true })
  estimatedCost: number;

  @Column('text', { array: true })
  ingredients: string[];

  @Column('text')
  recipe: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MealItem, item => item.meal)
  planItems: MealItem[];
}
