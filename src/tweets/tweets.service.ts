import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { TweetCategory } from './enums/category.enum';
import { TweetPermissions } from './entities/tweet-permissions.entity';

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
      WITH RECURSIVE TweetPermissions AS (
        SELECT t.id, tp.can_view
        FROM tweets t
        LEFT JOIN tweet_permissions tp ON t.id = tp.tweet_id
        WHERE t.id = $1

        UNION ALL

        SELECT t.id, COALESCE(tp.can_view, tp_parent.can_view)
        FROM tweets t
        JOIN TweetPermissions tp_parent ON t.parent_id = tp_parent.id
        LEFT JOIN tweet_permissions tp ON t.id = tp.tweet_id
      )
      SELECT can_view FROM TweetPermissions WHERE id = $1;
    `;
    const result = await this.tweetRepository.query(query, [tweetId]);
    return result.length > 0 ? result[0].can_view : false;
  }

  async canEditTweet(userId: number, tweetId: number): Promise<boolean> {
    const query = `
      WITH RECURSIVE TweetPermissions AS (
        SELECT t.id, tp.can_edit
        FROM tweets t
        LEFT JOIN tweet_permissions tp ON t.id = tp.tweet_id
        WHERE t.id = $1

        UNION ALL

        SELECT t.id, COALESCE(tp.can_edit, tp_parent.can_edit)
        FROM tweets t
        JOIN TweetPermissions tp_parent ON t.parent_id = tp_parent.id
        LEFT JOIN tweet_permissions tp ON t.id = tp.tweet_id
      )
      SELECT can_edit FROM TweetPermissions WHERE id = $1;
    `;
    const result = await this.tweetRepository.query(query, [tweetId]);
    return result.length > 0 ? result[0].can_edit : false;
  }

  async getTweets(page: number, limit: number): Promise<Tweet[]> {
    const offset = (page - 1) * limit;
    const query = `
    WITH RECURSIVE UserGroups AS (
        -- Base case: Direct group memberships
        SELECT gm.group_id, gm.user_id
        FROM GroupMemberships gm
        WHERE gm.user_id = ?

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
        WHERE tp.user_id = ? AND tp.can_view = TRUE

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
    SELECT DISTINCT tweet_id
    FROM ViewableTweets
    LIMIT $1 OFFSET $2;
    `;

    return this.tweetRepository.query(query, [limit, offset]);
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
