import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TweetPermission } from './tweet-permissions.entity';

@Entity()
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

  @OneToMany(() => TweetPermission, (permission) => permission.tweet)
  permissions: TweetPermission[];
}
