import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  findAll(): Promise<Group[]> {
    return this.groupsRepository.find();
  }

  findOne(
    id: number,
    relations: string[] = ['members', 'subGroups'],
  ): Promise<Group> {
    return this.groupsRepository.findOne({
      where: { id },
      relations,
    });
  }

  async create(
    name: string,
    userIds: string[],
    groupIds: number[],
  ): Promise<Group> {
    const group = this.groupsRepository.create({ name });

    const subGroups = await this.groupsRepository.find({
      where: groupIds.map((id) => ({ id })),
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

  async getAllGroupMembers(groupId: number): Promise<string[]> {
    const group = await this.findOne(groupId, ['members', 'subGroups']);
    const members = group.members.map((member) => member.user);

    for (const subGroup of group.subGroups) {
      const subGroupMembers = await this.getAllGroupMembers(subGroup.id);
      members.push(...subGroupMembers);
    }

    return members;
  }
}
