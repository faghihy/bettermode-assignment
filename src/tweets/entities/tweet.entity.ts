import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TweetPermissions } from './tweet-permissions.entity';

@Entity('tweets')
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.tweets)
  author: User;

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
