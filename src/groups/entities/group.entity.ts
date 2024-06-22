import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
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
  owner: string;

  @OneToMany(() => GroupMembers, (groupMember) => groupMember.group)
  members: GroupMembers[];

  @OneToMany(() => Group, (group) => group.parentGroup)
  subGroups: Group[];

  @ManyToOne(() => Group, (group) => group.subGroups)
  parentGroup: Group;
}
