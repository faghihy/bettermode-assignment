import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Group } from '../../groups/entities/group.entity';
import { GroupMembers } from '../../groups/entities/group-members.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @OneToMany(() => Group, (group) => group.owner)
  groups: Group[];

  @OneToMany(() => GroupMembers, (groupMember) => groupMember.user)
  groupMemberships: GroupMembers[];

  @OneToMany(() => Tweet, (tweet) => tweet.author)
  tweets: Tweet[];
}
