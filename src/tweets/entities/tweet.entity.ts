import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InputType, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
@InputType()
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  parentTweetId: string;

  @Column({ type: 'simple-array', nullable: true })
  hashtags: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  location: string;
}
