import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,

    @InjectRepository(GroupMembers)
    private groupMembersRepository: Repository<GroupMembers>,
  ) {}

  async createGroup(
    name: string,
    userIds: string[],
    groupIds: string[],
  ): Promise<Group> {
    const group = this.groupsRepository.create({ name });

    const groupIdsAsNumbers = groupIds.map((id) => parseInt(id, 10));

    const subGroups = await this.groupsRepository.find({
      where: {
        id: In(groupIdsAsNumbers),
      },
    });

    const groupMembers = userIds.map((user) => {
      const member = new GroupMembers();
      member.group = group;
      member.user = user;
      return member;
    });

    await this.groupMembersRepository.save(groupMembers);

    group.subGroups = subGroups;
    return this.groupsRepository.save(group);
  }

  async addMembers(
    groupId: number,
    userIds: string[],
    subGroupIds: number[],
  ): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'subGroups'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    const subGroups = await this.groupsRepository.find({
      where: subGroupIds.map((id) => ({ id })),
    });

    const groupMembers = userIds.map((user) => {
      const member = new GroupMembers();
      member.group = group;
      member.user = user;
      return member;
    });

    await this.groupMembersRepository.save(groupMembers);

    group.subGroups = subGroups;
    return this.groupsRepository.save(group);
  }
}
