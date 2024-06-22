import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { TweetPermission } from './entities/tweet-permissions.entity';

@Injectable()
export class TweetsService {
  create(
    authorId: string,
    content: string,
    hashtags: string[],
    category: string,
    location: string,
  ) {
    throw new Error('Method not implemented.');
  }
  findAll() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Tweet)
    private tweetRepository: Repository<Tweet>,
    @InjectRepository(TweetPermission)
    private tweetPermissionRepository: Repository<TweetPermission>,
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
    return this.tweetRepository.find({
      skip: offset,
      take: limit,
    });
  }
}
