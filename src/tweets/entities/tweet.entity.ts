import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TweetPermissions } from './tweet-permissions.entity';
import { TweetCategory } from '../enums/category.enum';

@ObjectType()
@Entity('tweets')
export class Tweet {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  authorId: string;

  @Field()
  @Column()
  content: string;

  @Column('simple-array', { nullable: true })
  hashtags: string[];

  @Column({
    type: 'enum',
    enum: TweetCategory,
  })
  category: TweetCategory;

  @Column({ nullable: true })
  location: string;

  @ManyToOne(() => Tweet, (tweet) => tweet.replies, { nullable: true })
  parent: Tweet;

  @OneToMany(() => Tweet, (tweet) => tweet.parent)
  replies: Tweet[];

  @Column({ default: true })
  inheritViewPermission: boolean;

  @Column({ default: true })
  inheritEditPermission: boolean;

  @OneToMany(() => TweetPermissions, (permission) => permission.tweet)
  permissions: TweetPermissions[];
}
