import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Meal } from '../../meal/entities/meal.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Meal)
  meal: Meal;

  @Column()
  liked: boolean;

  @Column({ nullable: true })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;
}
