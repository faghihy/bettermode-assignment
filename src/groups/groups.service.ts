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

  findOne(id: string): Promise<Group> {
    return this.groupsRepository.findOne({
      where: { id },
      relations: ['users', 'suGroups'],
    });
  }

  async create(
    name: string,
    userIds: string,
    groupIds: string[],
  ): Promise<Group> {
    const group = this.groupsRepository.create({ name });
    group.users = await this.groupsRepository.manager.findBy(User, userIds); // TODO
    group.subGroups = await this.groupsRepository.findBy(groupIds); // TODO
    return this.groupsRepository.save(group);
  }

  async getAllMembers(groupId: string): Promise<User[]> {
    const group = await this.findOne(groupId);
    const members = new Set<User>();

    const collectMembers = async (group: Group) => {
      group.users.forEach((user) => members.add(user));
      for (const subGroup of group.subGroups) {
        const fullSubGroup = await this.findOne(subGroup.id);
        await collectMembers(fullSubGroup);
      }
    };

    await collectMembers(group);
    return Array.from(members);
  }
}
