import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';
import { TweetCategory } from './enums/category.enum';
import { PaginatedTweet } from './types/paginated-tweet.type';
import { FilterTweet } from './inputs/filter-tweet.input';

@Resolver()
export class TweetsResolver {
  constructor(private tweetsService: TweetsService) {}

  @Query(() => PaginatedTweet)
  async getTweets(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('filter', { type: () => FilterTweet, nullable: true })
    filter: FilterTweet,
  ): Promise<PaginatedTweet> {
    return this.tweetsService.getTweets(page, limit, filter);
  }

  @Query(() => Boolean)
  async canUserViewTweet(
    @Args('userId') userId: number,
    @Args('tweetId') tweetId: number,
  ): Promise<boolean> {
    return this.tweetsService.canViewTweet(userId, tweetId);
  }

  @Query(() => Boolean)
  async canUserEditTweet(
    @Args('userId') userId: number,
    @Args('tweetId') tweetId: number,
  ): Promise<boolean> {
    return this.tweetsService.canEditTweet(userId, tweetId);
  }

  @Mutation(() => Tweet)
  createTweet(
    @Args('authorId') authorId: string,
    @Args('content') content: string,
    @Args('hashtags', { type: () => [String], nullable: true })
    hashtags: string[],
    @Args('category', { nullable: true }) category: TweetCategory,
    @Args('location', { nullable: true }) location: string,
  ) {
    return this.tweetsService.createTweet(
      authorId,
      content,
      hashtags,
      category,
      location,
    );
  }
}
