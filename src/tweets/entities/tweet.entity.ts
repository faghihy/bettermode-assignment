import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TweetPermissions } from './tweet-permissions.entity';

@ObjectType()
@Entity('tweets')
export class Tweet {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  author: string;

  @Field()
  @Column()
  content: string;

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
