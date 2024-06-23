import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Group } from './group.entity';

@ObjectType()
@Entity('group_members')
export class GroupMembers {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Group)
  @ManyToOne(() => Group, (group) => group.members)
  group: Group;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId: string;

  @Field(() => GroupMembers, { nullable: true })
  @ManyToOne(() => GroupMembers, { nullable: true })
  subGroup: GroupMembers;
}
