import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { CreateTweet } from './types/create-tweet.input';
import { FilterTweet } from './types/filter-tweet.input';
import { PaginatedTweet } from './types/paginated-tweet.type';
import { UpdateTweetPermissions } from './types/update-tweet-permissions.input';
import { TweetPermissions } from './entities/tweet-permissions.entity';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private tweetsRepository: Repository<Tweet>,
    @InjectRepository(TweetPermissions)
    private tweetPermissionsRepository: Repository<TweetPermissions>,
    private dataSource: DataSource,
  ) {}

  async canEditTweet(tweetId: string, userId: string): Promise<boolean> {
    const query = `
      WITH RECURSIVE groups AS (
          SELECT gm.groupId, gm.userId
          FROM group_members gm
          WHERE gm.userId = $1

          UNION

          SELECT gm.groupId, ug.userId
          FROM group_members gm
          JOIN groups ug ON gm.subGroup = ug.groupId
      )
      , EditableTweets AS (
          SELECT t.id AS tweetId, t.parentTweetId, t.inheritEditPermission
          FROM tweets t
          JOIN tweet_permissions tp ON t.id = tp.tweetId
          WHERE tp.userId = $2 AND tp.canEdit = TRUE

          UNION

          SELECT t.id AS tweetId, t.parentTweetId, t.inheritEditPermission
          FROM tweets t
          JOIN tweet_permissions tp ON t.id = tp.tweetId
          JOIN groups ug ON tp.groupId = ug.groupId
          WHERE tp.canEdit = TRUE

          UNION

          SELECT t.id AS tweetId, t.parentTweetId, t.inheritEditPermission
          FROM tweets t
          JOIN EditableTweets vt ON t.parentTweetId = vt.tweetId
          WHERE vt.inheritEditPermission = TRUE
      )
      SELECT DISTINCT t.*
      FROM tweets t
      JOIN EditableTweets vt ON t.id = vt.tweetId
    `;

    const result = await this.dataSource.query(query, [tweetId, userId]);
    return result[0].canEdit;
  }

  async paginateTweets(
    userId: string,
    page: number = 1,
    limit: number = 10,
    filter?: FilterTweet,
  ): Promise<PaginatedTweet> {
    const offset = (page - 1) * limit;

    const query = `
      WITH RECURSIVE groups AS (
          SELECT gm.groupId, gm.userId
          FROM group_members gm
          WHERE gm.userId = $1

          UNION

          SELECT gm.groupId, ug.userId
          FROM group_members gm
          JOIN groups ug ON gm.subGroup = ug.groupId
      )
      , ViewableTweets AS (
          SELECT t.id AS tweetId, t.parentTweetId, t.inheritViewPermission
          FROM tweets t
          JOIN tweet_permissions tp ON t.id = tp.tweetId
          WHERE tp.userId = $2 AND tp.canView = TRUE

          UNION

          SELECT t.id AS tweetId, t.parentTweetId, t.inheritViewPermission
          FROM tweets t
          JOIN tweet_permissions tp ON t.id = tp.tweetId
          JOIN groups ug ON tp.groupId = ug.groupId
          WHERE tp.canView = TRUE

          UNION

          SELECT t.id AS tweetId, t.parentTweetId, t.inheritViewPermission
          FROM tweets t
          JOIN ViewableTweets vt ON t.parentTweetId = vt.tweetId
          WHERE vt.inheritViewPermission = TRUE
      )
      SELECT DISTINCT t.*
      FROM tweets t
      JOIN ViewableTweets vt ON t.id = vt.tweetId
      ${this.buildFilterWhereClause(filter)}
      LIMIT $3 OFFSET $4
    `;

    const params = [userId, userId, limit, offset];
    const [tweets, count] = await Promise.all([
      this.dataSource.query(query, params),
      this.dataSource.query(
        `SELECT COUNT(DISTINCT t.id) FROM tweets t JOIN ViewableTweets vt ON t.id = vt.tweetId ${this.buildFilterWhereClause(filter)}`,
        [userId, userId],
      ),
    ]);

    return {
      nodes: tweets,
      hasNextPage: count[0].count > page * limit,
    };
  }

  private buildFilterWhereClause(filter?: FilterTweet): string {
    let whereClause = '';
    if (filter) {
      const conditions = [];
      if (filter.authorId) {
        conditions.push(`t.authorId = '${filter.authorId}'`);
      }
      if (filter.hashtag) {
        conditions.push(`'${filter.hashtag}' = ANY(t.hashtags)`);
      }
      if (filter.parentTweetId) {
        conditions.push(`t.parentTweetId = '${filter.parentTweetId}'`);
      }
      if (filter.category) {
        conditions.push(`t.category = '${filter.category}'`);
      }
      if (filter.location) {
        conditions.push(`t.location = '${filter.location}'`);
      }
      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }
    }
    return whereClause;
  }

  async createTweet(args: CreateTweet): Promise<Tweet> {
    const newTweet = this.tweetsRepository.create(args);
    return this.tweetsRepository.save(newTweet);
  }

  async updateTweetPermissions(
    input: UpdateTweetPermissions,
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        tweetId,
        inheritViewPermissions,
        inheritEditPermissions,
        viewPermissions,
        editPermissions,
      } = input;

      const tweet = await queryRunner.manager.findOne(Tweet, {
        where: { id: tweetId },
        relations: ['permissions'],
      });

      if (!tweet) {
        throw new Error('Tweet not found');
      }

      tweet.inheritViewPermission = inheritViewPermissions;
      tweet.inheritEditPermission = inheritEditPermissions;
      await queryRunner.manager.save(tweet);

      await queryRunner.manager.delete(TweetPermissions, { tweet: tweet });

      for (const userId of viewPermissions.userIds) {
        const permission = new TweetPermissions();
        permission.tweet = tweet;
        permission.userId = userId;
        permission.canView = true;
        await queryRunner.manager.save(permission);
      }

      for (const groupId of viewPermissions.groupIds) {
        const permission = new TweetPermissions();
        permission.tweet = tweet;
        permission.group = { id: groupId } as any;
        permission.canView = true;
        await queryRunner.manager.save(permission);
      }

      for (const userId of editPermissions.userIds) {
        const permission = new TweetPermissions();
        permission.tweet = tweet;
        permission.userId = userId;
        permission.canEdit = true;
        await queryRunner.manager.save(permission);
      }

      for (const groupId of editPermissions.groupIds) {
        const permission = new TweetPermissions();
        permission.tweet = tweet;
        permission.group = { id: groupId } as any;
        permission.canEdit = true;
        await queryRunner.manager.save(permission);
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Failed to update tweet permissions: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
