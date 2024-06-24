import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';
import { CreateGroup } from './types/create-group.type';

describe('GroupsService', () => {
  let service: GroupsService;
  let groupsRepository: Repository<Group>;
  let groupMembersRepository: Repository<GroupMembers>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getRepositoryToken(Group),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(GroupMembers),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                save: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    groupsRepository = module.get<Repository<Group>>(getRepositoryToken(Group));
    groupMembersRepository = module.get<Repository<GroupMembers>>(
      getRepositoryToken(GroupMembers),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGroup', () => {
    it('should create a new group with members', async () => {
      const createGroupInput: CreateGroup = {
        name: 'Test Group',
        ownerId: 'owner123',
        userIds: ['user1', 'user2'],
        groupIds: [],
      };

      const createdGroup = {
        id: '1',
        name: createGroupInput.name,
        ownerId: createGroupInput.ownerId,
      };

      jest
        .spyOn(groupsRepository, 'create')
        .mockReturnValue(createdGroup as any);
      jest
        .spyOn(groupsRepository, 'save')
        .mockResolvedValue(createdGroup as any);

      const queryRunnerMock = dataSource.createQueryRunner();
      const saveSpy = jest
        .spyOn(queryRunnerMock.manager, 'save')
        .mockResolvedValue(undefined);

      const result = await service.createGroup(createGroupInput);

      expect(result).toEqual(createdGroup);
      expect(saveSpy).toHaveBeenCalledTimes(3); // One for group, two for group members
    });

    it('should rollback transaction on error', async () => {
      const createGroupInput: CreateGroup = {
        name: 'Test Group',
        ownerId: 'owner123',
        userIds: ['user1', 'user2'],
        groupIds: [],
      };

      const queryRunnerMock = dataSource.createQueryRunner();
      jest
        .spyOn(queryRunnerMock.manager, 'save')
        .mockRejectedValue(new Error('Test Error'));

      await expect(service.createGroup(createGroupInput)).rejects.toThrow(
        'Test Error',
      );
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findMembersByGroupId', () => {
    it('should return members of a group', async () => {
      const groupId = 'group1';
      const members = [
        { id: '1', userId: 'user1', group: { id: groupId } },
        { id: '2', userId: 'user2', group: { id: groupId } },
      ];

      jest
        .spyOn(groupMembersRepository, 'find')
        .mockResolvedValue(members as any);

      const result = await service.findMembersByGroupId(groupId);
      expect(result).toEqual(members);
    });
  });
});
