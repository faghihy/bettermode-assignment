import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GroupMembers } from './group-members.entity';

@ObjectType()
@Entity('groups')
export class Group {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ownerId: string;

  @Field(() => [GroupMembers], { nullable: true })
  @OneToMany(() => GroupMembers, (groupMember) => groupMember.group)
  members: GroupMembers[];
}
