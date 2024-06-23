import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GroupMembers } from './group-members.entity';

@ObjectType()
@Entity('groups')
export class Group {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ nullable: true })
  ownerId: string;

  @OneToMany(() => GroupMembers, (groupMember) => groupMember.group)
  members: GroupMembers[];
}
