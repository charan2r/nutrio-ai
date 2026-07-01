import { MealPlan } from '../../meal-plan/entities/meal-plan.entity';
import { Meal } from '../../meal/entities/meal.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
  } from 'typeorm';

@Unique(['mealPlan', 'day', 'mealType'])

@Entity('meal_items')
export class MealItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MealPlan, { onDelete: 'CASCADE' })
  mealPlan: MealPlan;

  @ManyToOne(() => Meal)
  meal: Meal;

  @Column()
  day: number; 

  @Column()
  mealType: 'breakfast' | 'lunch' | 'dinner';

}
