import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { MealPlan } from "../../meal-plan/entities/meal-plan.entity";


@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MealPlan, { onDelete: 'CASCADE' })
  mealPlan: MealPlan;

  @Column()
  day: number;

  @Column()
  mealType: string;

  @Column()
  name: string;

  @Column()
  calories: number;

  @Column('float')
  protein: number;

  @Column('float')
  carbs: number;

  @Column('float')
  fat: number;

  @Column('text')
  recipe: string;
}
