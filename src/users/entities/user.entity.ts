import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { GroupMembers } from '../../groups/entities/group-members.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Group, (group) => group.owner)
  groups: Group[];

  @OneToMany(() => GroupMembers, (groupMember) => groupMember.user)
  groupMemberships: GroupMembers[];

  @OneToMany(() => Tweet, (tweet) => tweet.author)
  tweets: Tweet[];
}
