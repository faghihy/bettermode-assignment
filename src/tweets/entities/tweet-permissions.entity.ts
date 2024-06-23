import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tweet } from './tweet.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('tweet_permissions')
export class TweetPermissions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tweet, (tweet) => tweet.permissions)
  tweet: Tweet;

  @ManyToOne(() => Group, { nullable: true })
  group?: Group;

  @Column({ nullable: true })
  userId?: string;

  @Column({ default: false })
  canEdit: boolean;

  @Column({ default: true })
  canView: boolean;
}
