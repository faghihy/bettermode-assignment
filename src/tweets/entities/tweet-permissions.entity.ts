import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Tweet } from './tweet.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Group } from '../../groups/entities/group.entity';

@ObjectType()
@Entity('tweet_permissions')
export class TweetPermissions {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Tweet)
  @ManyToOne(() => Tweet, (tweet) => tweet.permissions)
  tweet: Tweet;

  @Field()
  @ManyToOne(() => Group, { nullable: true })
  group?: Group;

  @Field()
  @Column({ nullable: true })
  userId?: string;

  @Field()
  @Column({ default: false })
  canEdit: boolean;

  @Field()
  @Column({ default: true })
  canView: boolean;
}
