import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tweet } from './tweet.entity';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('tweets_permissions')
export class TweetPermissions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tweet, (tweet) => tweet.permissions)
  tweet: Tweet;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Group, { nullable: true })
  group: Group;

  @Column({ default: false })
  canEdit: boolean;

  @Column({ default: true })
  canView: boolean;
}
