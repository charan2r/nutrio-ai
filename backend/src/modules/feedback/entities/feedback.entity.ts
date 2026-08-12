import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MealItem } from '../../meal-items/entities/meal-item.entity';

@Unique(['userId', 'mealItemId'])
@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  mealItemId: string;

  @ManyToOne(() => MealItem, (item) => item.feedbacks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mealItemId' })
  mealItem: MealItem;

  /** Optional: user liked or disliked the meal */
  @Column({ nullable: true })
  liked: boolean | null;

  /** Optional: 1-5 rating */
  @Column({ type: 'smallint', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  /**
   * too_spicy | too_expensive | hard_to_prepare | unavailable_ingredients
   * | portion_too_small | portion_too_large | disliked_taste
   */
  @Column({ type: 'text', array: true, default: '{}' })
  reasonTags: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
