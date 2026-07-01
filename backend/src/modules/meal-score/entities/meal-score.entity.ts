import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Meal } from "../../meal/entities/meal.entity";
import { MealPlan } from "../../meal-plan/entities/meal-plan.entity";

@Entity('meal_scores')
export class MealScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meal)
  meal: Meal;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MealPlan, { nullable: true, onDelete: 'SET NULL' })
  mealPlan: MealPlan;

  @Column('float')
  totalScore: number;

  @Column('float')
  nutritionScore: number;

  @Column('float')
  constraintScore: number;

  @Column('float')
  preferenceScore: number;

  @Column('float')
  diversityScore: number;

  @CreateDateColumn()
  createdAt: Date;
}
