import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GroupMembers } from './group-members.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  owner: string;

  @OneToMany(() => GroupMembers, (groupMember) => groupMember.group)
  members: GroupMembers[];

  @OneToMany(() => Group, (group) => group.parentGroup)
  subGroups: Group[];

  @ManyToOne(() => Group, (group) => group.subGroups)
  parentGroup: Group;
}
