import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { Tweet } from '../src/tweets/entities/tweet.entity';
import { TweetPermissions } from '../src/tweets/entities/tweet-permissions.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TweetCategory } from '../src/tweets/types/category.enum';

describe('TweetsResolver (e2e)', () => {
  let app: INestApplication;
  let tweetsRepository: Repository<Tweet>;
  let tweetPermissionsRepository: Repository<TweetPermissions>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tweetsRepository = moduleFixture.get<Repository<Tweet>>(
      getRepositoryToken(Tweet),
    );
    tweetPermissionsRepository = moduleFixture.get<
      Repository<TweetPermissions>
    >(getRepositoryToken(TweetPermissions));
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await tweetPermissionsRepository.query('DELETE FROM tweet_permissions');
    await tweetsRepository.query('DELETE FROM tweets');
  });

  it('should create a tweet', async () => {
    const createTweetMutation = `
      mutation CreateTweet($input: CreateTweet!) {
        createTweet(input: $input) {
          id
          content
          authorId
        }
      }
    `;

    const variables = {
      input: {
        content: 'This is a test tweet',
        authorId: 'user123',
        hashtags: ['test'],
        location: 'test location',
        category: TweetCategory.Tech,
      },
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: createTweetMutation,
        variables,
      })
      .expect(200);

    const tweet = response.body.data.createTweet;
    expect(tweet).toBeDefined();
    expect(tweet.content).toBe('This is a test tweet');
    expect(tweet.authorId).toBe('user123');
  });

  it('should paginate tweets', async () => {
    const paginateTweetsQuery = `
      query PaginateTweets($userId: String!, $limit: Int, $page: Int, $filter: FilterTweet) {
        paginateTweets(userId: $userId, limit: $limit, page: $page, filter: $filter) {
          nodes {
            id
            content
            authorId
          }
          hasNextPage
        }
      }
    `;

    const userId = 'user123';

    // Create some tweets first
    await tweetsRepository.save([
      {
        content: 'Tweet 1',
        authorId: userId,
        hashtags: ['test1'],
        inheritViewPermission: true,
        inheritEditPermission: true,
        category: TweetCategory.Tech,
      },
      {
        content: 'Tweet 2',
        authorId: userId,
        hashtags: ['test2'],
        inheritViewPermission: true,
        inheritEditPermission: true,
        category: TweetCategory.Tech,
      },
      {
        content: 'Tweet 3',
        authorId: userId,
        hashtags: ['test3'],
        inheritViewPermission: true,
        inheritEditPermission: true,
        category: TweetCategory.Tech,
      },
    ]);

    const variables = {
      userId,
      limit: 2,
      page: 1,
      filter: {},
    };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: paginateTweetsQuery,
        variables,
      })
      .expect(200);

    const { nodes, hasNextPage } = response.body.data.paginateTweets;
    expect(nodes).toHaveLength(2);
    expect(nodes[0].content).toBe('Tweet 1');
    expect(nodes[1].content).toBe('Tweet 2');
    expect(hasNextPage).toBe(true);
  });

  it('should determine if a user can edit a tweet', async () => {
    const canEditTweetQuery = `
      query CanEditTweet($userId: String!, $tweetId: String!) {
        canEditTweet(userId: $userId, tweetId: $tweetId)
      }
    `;

    // Create a tweet first
    const tweet = await tweetsRepository.save({
      content: 'This is a test tweet',
      authorId: 'user123',
      hashtags: ['test'],
      location: 'test location',
      category: TweetCategory.Tech,
      inheritViewPermission: true,
      inheritEditPermission: true,
    });

    // Create a permission for the user to edit the tweet
    await tweetPermissionsRepository.save({
      tweet,
      userId: 'user123',
      canEdit: true,
      canView: true,
    });

    const userId = 'user123';
    const tweetId = tweet.id;

    const variables = { userId, tweetId };

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: canEditTweetQuery,
        variables,
      })
      .expect(200);

    const canEdit = response.body.data.canEditTweet;
    expect(canEdit).toBe(true);
  });
});
