import { Test, TestingModule } from '@nestjs/testing';
import { GroupsResolver } from './groups.resolver';
import { GroupsService } from './groups.service';
import { CreateGroup } from './types/create-group.type';
import { Group } from './entities/group.entity';

describe('GroupsResolver', () => {
  let resolver: GroupsResolver;
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsResolver,
        {
          provide: GroupsService,
          useValue: {
            createGroup: jest.fn(),
            findMembersByGroupId: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<GroupsResolver>(GroupsResolver);
    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createGroup', () => {
    it('should create a group', async () => {
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
        .spyOn(service, 'createGroup')
        .mockResolvedValue(createdGroup as Group);

      const result = await resolver.createGroup(createGroupInput);
      expect(result).toEqual(createdGroup);
    });
  });

  describe('members', () => {
    it('should return members of a group', async () => {
      const groupId = 'group1';
      const group: Group = {
        id: groupId,
        name: 'Test Group',
        ownerId: 'owner123',
        members: [],
      };

      const members = [
        { id: '1', userId: 'user1', group: group },
        { id: '2', userId: 'user2', group: group },
      ];

      jest
        .spyOn(service, 'findMembersByGroupId')
        .mockResolvedValue(members as any);

      const result = await resolver.members(group);
      expect(result).toEqual(members);
    });
  });
});
