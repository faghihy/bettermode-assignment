import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TweetCategory } from '../types/category.enum';
import { TweetPermissions } from './tweet-permissions.entity';

@ObjectType()
@Entity('tweets')
export class Tweet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  authorId: string;

  @Field()
  @Column()
  content: string;

  @Column('simple-array')
  hashtags: string[];

  @Column({
    type: 'enum',
    enum: TweetCategory,
    nullable: true,
  })
  category?: TweetCategory;

  @Column({ nullable: true })
  location?: string;

  @ManyToOne(() => Tweet, (tweet) => tweet.replies, { nullable: true })
  parent?: Tweet;

  @OneToMany(() => Tweet, (tweet) => tweet.parent)
  replies: Tweet[];

  @Column({ default: true })
  inheritViewPermission: boolean;

  @Column({ default: true })
  inheritEditPermission: boolean;

  @OneToMany(() => TweetPermissions, (tweetPermission) => tweetPermission.tweet)
  permissions: TweetPermissions[];
}
