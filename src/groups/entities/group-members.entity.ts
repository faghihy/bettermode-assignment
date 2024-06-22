import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Group } from './group.entity';

@Entity('groups_permissions')
export class GroupMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.members)
  group: Group;

  @Column({ nullable: true })
  user: string;

  @ManyToOne(() => GroupMembers, { nullable: true })
  subGroup: GroupMembers;
}
