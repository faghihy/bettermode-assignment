import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { Group } from '../src/groups/entities/group.entity';
import { GroupMembers } from '../src/groups/entities/group-members.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('GroupsResolver (e2e)', () => {
  let app: INestApplication;
  let groupRepository: Repository<Group>;
  let groupMembersRepository: Repository<GroupMembers>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    groupRepository = moduleFixture.get<Repository<Group>>(
      getRepositoryToken(Group),
    );
    groupMembersRepository = moduleFixture.get<Repository<GroupMembers>>(
      getRepositoryToken(GroupMembers),
    );
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await groupMembersRepository.query('DELETE FROM group_members');
    await groupRepository.query('DELETE FROM groups');
  });

  it('should create a group and its members', async () => {
    const createGroupMutation = `
      mutation CreateGroup($input: CreateGroup!) {
        createGroup(input: $input) {
          id
          name
          ownerId
          members {
            id
            userId
            group {
              id
            }
            subGroup {
              id
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        name: 'Test Group',
        ownerId: 'owner123',
        userIds: ['user1', 'user2'],
        groupIds: [], // Add any subgroup IDs if necessary
      },
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: createGroupMutation,
        variables,
      })
      .expect(200);

    console.log('Response:', response.body);

    const group = response.body.data.createGroup;
    expect(group).toBeDefined();
    expect(group.name).toBe('Test Group');
    expect(group.ownerId).toBe('owner123');
    expect(Array.isArray(group.members)).toBe(true);
    expect(group.members).toHaveLength(2);
    expect(group.members[0].userId).toBe('user1');
    expect(group.members[1].userId).toBe('user2');
  });
});
