import { User } from "../../user/entities/user.entity";
import { Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn, Column } from "typeorm";

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column('float')
  heightCm: number;

  @Column('float')
  weightKg: number;

  @Column()
  goal: string;

  @Column()
  activityLevel: string;
}
