import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tweet } from './tweet.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('tweets_permissions')
export class TweetPermissions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tweet, (tweet) => tweet.viewPermissions) // TODO
  tweet: Tweet;

  @Column({ nullable: true })
  owner: string;

  @ManyToOne(() => Group, { nullable: true })
  group: Group;

  @Column({ default: false })
  canEdit: boolean;

  @Column({ default: true })
  canView: boolean;
}
