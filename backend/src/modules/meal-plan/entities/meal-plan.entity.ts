import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { User } from "../../user/entities/user.entity";

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

  @Column({ type: 'jsonb' })
  planJson: any;

  @Column()
  modelUsed: string; // groq / hf

  @Column({ default: 'pending' })
  generationStatus: string;

  @CreateDateColumn()
  createdAt: Date;
}
