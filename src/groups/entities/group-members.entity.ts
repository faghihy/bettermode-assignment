import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../users/entities/user.entity';

@Entity('groups_permissions')
export class GroupMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.members)
  group: Group;

  @ManyToOne(() => User, (user) => user.groupMemberships)
  user: User;

  @ManyToOne(() => GroupMembers, { nullable: true })
  subGroup: GroupMembers;
}
