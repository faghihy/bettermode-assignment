import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,

    @InjectRepository(GroupMembers)
    private groupMembersRepository: Repository<GroupMembers>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    userIds: number[],
    groupIds: number[],
  ): Promise<Group> {
    const group = this.groupsRepository.create({ name });

    const users = await this.usersRepository.find({
      where: userIds.map((id) => ({ id })),
    });
    const subGroups = await this.groupsRepository.find({
      where: groupIds.map((id) => ({ id })),
    });

    const groupMembers = users.map((user) => {
      const member = new GroupMembers();
      member.group = group;
      member.user = user.id.toString();
      return member;
    });

    await this.groupMembersRepository.save(groupMembers);

    group.subGroups = subGroups;
    return this.groupsRepository.save(group);
  }

  async addMembers(
    groupId: number,
    userIds: number[],
    subGroupIds: number[],
  ): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'subGroups'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    const users = await this.usersRepository.find({
      where: userIds.map((id) => ({ id })),
    });
    const subGroups = await this.groupsRepository.find({
      where: subGroupIds.map((id) => ({ id })),
    });

    const groupMembers = users.map((user) => {
      const member = new GroupMembers();
      member.group = group;
      member.user = user.id.toString();
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
