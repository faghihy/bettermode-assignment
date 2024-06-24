import { Test, TestingModule } from '@nestjs/testing';
import { GroupsResolver } from './groups.resolver';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { CreateGroup } from './types/create-group.type';

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
    it('should call GroupsService.createGroup and return a group', async () => {
      const createGroupInput: CreateGroup = {
        name: 'Test Group',
        ownerId: '1',
        userIds: ['2', '3'],
        groupIds: ['4', '5'],
      };

      const createdGroup: Group = {
        id: '1',
        name: 'Test Group',
        ownerId: '1',
        members: [],
      } as Group;

      jest.spyOn(service, 'createGroup').mockResolvedValue(createdGroup);

      const result = await resolver.createGroup(createGroupInput);

      expect(result).toEqual(createdGroup);
      expect(service.createGroup).toHaveBeenCalledWith(createGroupInput);
    });
  });
});
