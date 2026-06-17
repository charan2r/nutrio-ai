import { Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn, Column } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity('diet')
export class Diet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  dietType: string;

  @Column({ default: 3 })
  mealsPerDay: number;

  @Column({ nullable: true })
  calorieTarget: number;

  @Column()
  appetiteLevel: string;

  @Column({ nullable: true })
  budgetLevel: string;
}