import { Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  dailyCalorieTarget: number;

  @Column()
  dietType: 'vegetarian' | 'non_veg';

  @Column()
  appetiteLevel: 'low' | 'medium' | 'high';

  @Column({ nullable: true })
  dailyBudget: number;

  @Column({ nullable: true })
  preferredCuisine: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
