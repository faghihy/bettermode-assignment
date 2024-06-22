import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';
import { TweetCategory } from './enums/category.enum';
import { PaginatedTweet } from './types/paginated-tweet.type';

@Resolver()
export class TweetsResolver {
  constructor(private tweetsService: TweetsService) {}

  @Query(() => PaginatedTweet)
  async getTweets(
    @Args('page') page: number,
    @Args('limit') limit: number,
  ): Promise<PaginatedTweet> {
    return this.tweetsService.getTweets(page, limit);
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
