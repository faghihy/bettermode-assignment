import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';
import { TweetCategory } from './enums/category.enum';
import { PaginatedTweet } from './types/paginated-tweet.type';
import { FilterTweet } from './inputs/filter-tweet.input';
import { UpdateTweetPermissions } from './inputs/update-tweet-permissions.input';

@Resolver()
export class TweetsResolver {
  constructor(private tweetsService: TweetsService) {}

  @Query(() => PaginatedTweet)
  async paginateTweets(
    @Args('userId') userId: string,
    @Args('page') page: number,
    @Args('limit') limit: number,
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

  @Mutation(() => Tweet)
  async updateTweetPermissions(
    @Args('tweetId') tweetId: number,
    @Args('updateTweetPermissions')
    updateTweetPermissions: UpdateTweetPermissions,
  ): Promise<Tweet> {
    return this.tweetsService.updateTweetPermissions(
      tweetId,
      updateTweetPermissions,
    );
  }
}
