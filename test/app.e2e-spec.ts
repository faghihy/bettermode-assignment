import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('TweetsResolver', () => {
    it('should paginate tweets', async () => {
      const query = `
        query {
          paginateTweets(userId: "1", limit: 10, page: 1) {
            nodes {
              id
              content
            }
            hasNextPage
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.paginateTweets.nodes).toBeDefined();
      expect(response.body.data.paginateTweets.hasNextPage).toBeDefined();
    });

    it('should check if user can edit tweet', async () => {
      const query = `
        query {
          canEditTweet(userId: "1", tweetId: "2")
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.canEditTweet).toBeDefined();
    });

    it('should create a tweet', async () => {
      const mutation = `
        mutation {
          createTweet(args: { content: "New tweet", authorId: "1" }) {
            id
            content
            authorId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ mutation })
        .expect(200);

      expect(response.body.data.createTweet).toBeDefined();
      expect(response.body.data.createTweet.content).toBe('New tweet');
      expect(response.body.data.createTweet.authorId).toBe('1');
    });

    it('should update tweet permissions', async () => {
      const mutation = `
        mutation {
          updateTweetPermissions(input: {
            tweetId: "1",
            inheritViewPermissions: true,
            inheritEditPermissions: true,
            viewPermissions: { userIds: ["2", "3"] },
            editPermissions: { userIds: ["4"] }
          })
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ mutation })
        .expect(200);

      expect(response.body.data.updateTweetPermissions).toBe(true);
    });
  });
});
