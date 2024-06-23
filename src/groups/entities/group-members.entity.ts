import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Group } from './group.entity';

@Entity('group_members')
export class GroupMembers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, (group) => group.members)
  group: Group;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => GroupMembers, { nullable: true })
  subGroup: GroupMembers;
}
