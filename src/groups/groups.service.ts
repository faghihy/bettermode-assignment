import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

  findAll(): Promise<Group[]> {
    return this.groupsRepository.find();
  }

  findOne(
    id: string,
    relations: string[] = ['users', 'suGroups'],
  ): Promise<Group> {
    return this.groupsRepository.findOne({
      where: { id },
      relations,
    });
  }

  async create(
    name: string,
    userIds: string[],
    groupIds: string[],
  ): Promise<Group> {
    const group = this.groupsRepository.create({ name });
    group.users = await this.groupsRepository.manager.findByIds(User, userIds); // TODO
    group.subGroups = await this.groupsRepository.findByIds(groupIds); // TODO
    return this.groupsRepository.save(group);
  }

  async getAllGroupMembers(groupId: string): Promise<User[]> {
    const group = await this.findOne(groupId, {
      relations: ['users', 'subGroups'],
    });
    const members = [...group.users];

    for (const subGroup of group.subGroups) {
      const subGroupMembers = await this.getAllGroupMembers(subGroup.id);
      members.push(...subGroupMembers);
    }
    return members;
  }
}
