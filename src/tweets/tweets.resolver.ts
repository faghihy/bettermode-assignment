import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';
import { CreateTweet } from './types/create-tweet.input';
import { FilterTweet } from './types/filter-tweet.input';
import { PaginatedTweet } from './types/paginated-tweet.type';
import { UpdateTweetPermissions } from './types/update-tweet-permissions.input';

@Resolver(() => Tweet)
export class TweetsResolver {
  constructor(private readonly tweetsService: TweetsService) {}

  @Query(() => PaginatedTweet)
  async paginateTweets(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, nullable: true })
    limit: number = 10,
    @Args('page', { type: () => Int, nullable: true })
    page: number = 1,
    @Args('filter', { type: () => FilterTweet, nullable: true })
    filter: FilterTweet,
  ): Promise<PaginatedTweet> {
    return this.tweetsService.paginateTweets(userId, page, limit, filter);
  }

  @Query(() => Boolean)
  async canEditTweet(
    @Args('userId') userId: string,
    @Args('tweetId') tweetId: string,
  ): Promise<boolean> {
    return this.tweetsService.canEditTweet(userId, tweetId);
  }

  @Mutation(() => Tweet)
  async createTweet(args: CreateTweet) {
    return this.tweetsService.createTweet(args);
  }

  @Mutation(() => Boolean)
  async updateTweetPermissions(
    @Args('input') input: UpdateTweetPermissions,
  ): Promise<boolean> {
    return this.tweetsService.updateTweetPermissions(input);
  }
}
