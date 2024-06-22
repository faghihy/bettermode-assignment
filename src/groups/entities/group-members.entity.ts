import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.members)
  group: Group;

  @ManyToOne(() => User, (user) => user.groupMemberships)
  user: User;

  @ManyToOne(() => GroupMember, { nullable: true })
  subGroup: GroupMember;
}
