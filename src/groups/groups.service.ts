import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';
import { CreateGroup } from './types/create-group.type';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,

    @InjectRepository(GroupMembers)
    private groupMembersRepository: Repository<GroupMembers>,

    private dataSource: DataSource,
  ) {}

  async createGroup(createGroupInput: CreateGroup): Promise<Group> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const group = this.groupsRepository.create({
        name: createGroupInput.name,
        ownerId: createGroupInput.ownerId,
      });
      await queryRunner.manager.save(group);

      const groupMembers: GroupMembers[] = [];

      for (const userId of createGroupInput.userIds) {
        const member = this.groupMembersRepository.create({
          group: group,
          userId: userId,
        });
        groupMembers.push(member);
      }

      for (const groupId of createGroupInput.groupIds) {
        const subGroup = await this.groupsRepository.findOneBy({ id: groupId });
        if (subGroup) {
          const member = this.groupMembersRepository.create({
            group: group,
            subGroup: subGroup,
          });
          groupMembers.push(member);
        }
      }

      await queryRunner.manager.save(groupMembers);

      await queryRunner.commitTransaction();

      return group;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findMembersByGroupId(groupId: string): Promise<GroupMembers[]> {
    return this.groupMembersRepository.find({
      where: { group: { id: groupId } },
      relations: ['subGroup'],
    });
  }
}
