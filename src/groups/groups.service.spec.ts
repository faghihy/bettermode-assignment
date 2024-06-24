import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';
import { CreateGroup } from './types/create-group.type';
import { getRepositoryToken } from '@nestjs/typeorm';

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
              manager: {
                save: jest.fn(),
              },
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
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

  it('should create a group and its members', async () => {
    const createGroupInput: CreateGroup = {
      name: 'Test Group',
      ownerId: '1',
      userIds: ['2', '3'],
      groupIds: ['4', '5'],
    };

    const createdGroup: Group = {
      id: '1',
      name: createGroupInput.name,
      ownerId: createGroupInput.ownerId,
      members: [],
    } as Group;

    const subGroup: Group = {
      id: '4',
      name: 'Sub Group',
      ownerId: '6',
      members: [],
    } as Group;
    // const groupMember: GroupMembers = {
    //   id: '1',
    //   group: createdGroup,
    //   userId: '2',
    // } as GroupMembers;

    jest.spyOn(groupsRepository, 'create').mockReturnValue(createdGroup);
    jest.spyOn(groupsRepository, 'save').mockResolvedValue(createdGroup);
    jest.spyOn(groupsRepository, 'findOneBy').mockResolvedValue(subGroup);
    jest
      .spyOn(groupMembersRepository, 'create')
      .mockImplementation((entity) => ({ ...entity, id: '1' }) as GroupMembers);
    jest
      .spyOn(dataSource.createQueryRunner().manager, 'save')
      .mockResolvedValue([]);

    const result = await service.createGroup(createGroupInput);

    expect(result).toEqual(createdGroup);
    expect(groupsRepository.create).toHaveBeenCalledWith({
      name: createGroupInput.name,
      ownerId: createGroupInput.ownerId,
    });
    expect(groupsRepository.save).toHaveBeenCalledWith(createdGroup);

    expect(groupMembersRepository.create).toHaveBeenCalledTimes(4); // 2 userIds + 2 groupIds
    expect(dataSource.createQueryRunner().connect).toHaveBeenCalled();
    expect(dataSource.createQueryRunner().startTransaction).toHaveBeenCalled();
    expect(dataSource.createQueryRunner().manager.save).toHaveBeenCalledTimes(
      2,
    ); // 1 for group + 1 for members
    expect(dataSource.createQueryRunner().commitTransaction).toHaveBeenCalled();
    expect(dataSource.createQueryRunner().release).toHaveBeenCalled();
  });

  it('should rollback transaction if an error occurs', async () => {
    const createGroupInput: CreateGroup = {
      name: 'Test Group',
      ownerId: '1',
      userIds: ['2', '3'],
      groupIds: ['4', '5'],
    };

    jest.spyOn(groupsRepository, 'create').mockImplementation(() => {
      throw new Error('Test Error');
    });

    await expect(service.createGroup(createGroupInput)).rejects.toThrow(
      'Test Error',
    );
    expect(
      dataSource.createQueryRunner().rollbackTransaction,
    ).toHaveBeenCalled();
    expect(dataSource.createQueryRunner().release).toHaveBeenCalled();
  });
});
