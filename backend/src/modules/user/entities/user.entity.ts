import { CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Column } from "typeorm";
import { UserProfile } from "../../profile/entities/profile.entity";
import { MealPlan } from "../../meal-plan/entities/meal-plan.entity";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;

  @OneToMany(() => MealPlan, plan => plan.user)
  mealPlans: MealPlan[];
}


