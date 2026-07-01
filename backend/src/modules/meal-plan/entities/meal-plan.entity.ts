import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { MealItem } from "../../meal-items/entities/meal-item.entity";

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.mealPlans, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ nullable: true })
  totalCalories: number;

  @Column()
  modelUsed: string; // groq / hf

  @Column()
  generationMethod: 'ai' | 'hybrid_engine';

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MealItem, item => item.mealPlan)
  items: MealItem[];
}
