import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { TweetCategory } from './enums/category.enum';
import { TweetPermissions } from './entities/tweet-permissions.entity';
import { PaginatedTweet } from './types/paginated-tweet.type';
import { FilterTweet } from './inputs/filter-tweet.input';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
    @InjectRepository(TweetPermissions)
    private tweetPermissionRepository: Repository<TweetPermissions>,
  ) {}

  async canViewTweet(userId: number, tweetId: number): Promise<boolean> {
    const query = `
    WITH RECURSIVE UserGroups AS (
        SELECT gm.group_id, gm.user_id
        FROM GroupMemberships gm
        WHERE gm.user_id = $1

        UNION

        SELECT gm.group_id, ug.user_id
        FROM GroupMemberships gm
        JOIN UserGroups ug ON gm.sub_group_id = ug.group_id
    )
    , ViewableTweets AS (
        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_view
        FROM Tweets t
        JOIN TweetPermissions tp ON t.tweet_id = tp.tweet_id
        WHERE tp.user_id = $1 AND tp.can_view = TRUE

        UNION

        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_view
        FROM Tweets t
        JOIN TweetPermissions tp ON t.tweet_id = tp.tweet_id
        JOIN UserGroups ug ON tp.group_id = ug.group_id
        WHERE tp.can_view = TRUE

        UNION

        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_view
        FROM Tweets t
        JOIN ViewableTweets vt ON t.parent_tweet_id = vt.tweet_id
        WHERE vt.auto_inherit_view = TRUE
    )
    SELECT DISTINCT t.tweet_id
    FROM Tweets t
    JOIN ViewableTweets vt ON t.tweet_id = vt.tweet_id
    WHERE t.tweet_id = $2
    `;

    const result = await this.tweetRepository.query(query, [userId, tweetId]);
    return result.length > 0;
  }

  async canEditTweet(userId: number, tweetId: number): Promise<boolean> {
    const query = `
    WITH RECURSIVE UserGroups AS (
        SELECT gm.group_id, gm.user_id
        FROM GroupMemberships gm
        WHERE gm.user_id = $1

        UNION

        SELECT gm.group_id, ug.user_id
        FROM GroupMemberships gm
        JOIN UserGroups ug ON gm.sub_group_id = ug.group_id
    )
    , EditableTweets AS (
        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_edit
        FROM Tweets t
        JOIN TweetPermissions tp ON t.tweet_id = tp.tweet_id
        WHERE tp.user_id = $1 AND tp.can_edit = TRUE

        UNION

        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_edit
        FROM Tweets t
        JOIN TweetPermissions tp ON t.tweet_id = tp.tweet_id
        JOIN UserGroups ug ON tp.group_id = ug.group_id
        WHERE tp.can_edit = TRUE

        UNION

        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_edit
        FROM Tweets t
        JOIN EditableTweets vt ON t.parent_tweet_id = vt.tweet_id
        WHERE vt.auto_inherit_edit = TRUE
    )
    SELECT DISTINCT t.tweet_id
    FROM Tweets t
    JOIN EditableTweets vt ON t.tweet_id = vt.tweet_id
    WHERE t.tweet_id = $2
    `;

    const result = await this.tweetRepository.query(query, [userId, tweetId]);
    return result.length > 0;
  }

  async getTweets(
    page: number,
    limit: number,
    filter: FilterTweet,
  ): Promise<PaginatedTweet> {
    let query = `
    WITH RECURSIVE UserGroups AS (
        -- Base case: Direct group memberships
        SELECT gm.group_id, gm.user_id
        FROM GroupMemberships gm
        WHERE gm.user_id = $1

        UNION

        -- Recursive case: Memberships through sub-groups
        SELECT gm.group_id, ug.user_id
        FROM GroupMemberships gm
        JOIN UserGroups ug ON gm.sub_group_id = ug.group_id
    )
    , ViewableTweets AS (
        -- Tweets with direct view permissions for the user
        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_view
        FROM Tweets t
        JOIN TweetPermissions tp ON t.tweet_id = tp.tweet_id
        WHERE tp.user_id = $2 AND tp.can_view = TRUE

        UNION

        -- Tweets with view permissions through user's groups
        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_view
        FROM Tweets t
        JOIN TweetPermissions tp ON t.tweet_id = tp.tweet_id
        JOIN UserGroups ug ON tp.group_id = ug.group_id
        WHERE tp.can_view = TRUE

        UNION

        -- Recursive case: Inherit view permissions from parent tweets
        SELECT t.tweet_id, t.parent_tweet_id, t.auto_inherit_view
        FROM Tweets t
        JOIN ViewableTweets vt ON t.parent_tweet_id = vt.tweet_id
        WHERE vt.auto_inherit_view = TRUE
    )
    SELECT DISTINCT t.*
    FROM Tweets t
    JOIN ViewableTweets vt ON t.tweet_id = vt.tweet_id
    `;

    const params = []; // TODO

    if (filter) {
      if (filter.authorId) {
        query += ` AND t.authorId = $${params.length + 1}`;
        params.push(filter.authorId);
      }
      if (filter.hashtag) {
        query += ` AND $${params.length + 1} = ANY (t.hashtags)`;
        params.push(filter.hashtag);
      }
      if (filter.parentTweetId) {
        query += ` AND t.parentTweetId = $${params.length + 1}`;
        params.push(filter.parentTweetId);
      }
      if (filter.category) {
        query += ` AND t.category = $${params.length + 1}`;
        params.push(filter.category);
      }
      if (filter.location) {
        query += ` AND t.location = $${params.length + 1}`;
        params.push(filter.location);
      }
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const tweets = await this.tweetRepository.query(query, params);
    const total = tweets.length;

    const hasNextPage = page * limit < total;

    return {
      nodes: tweets,
      hasNextPage,
    };
  }

  async createTweet(
    authorId: string,
    content: string,
    hashtags: string[],
    category: TweetCategory,
    location: string,
  ): Promise<Tweet> {
    const newTweet = this.tweetRepository.create({
      authorId,
      content,
      hashtags,
      category,
      location,
    });
    return this.tweetRepository.save(newTweet);
  }
}
