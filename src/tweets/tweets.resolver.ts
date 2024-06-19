import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';

@Resolver()
export class TweetsResolver {
  constructor(private tweetsService: TweetsService) {}

  @Query(() => [Tweet])
  tweets() {
    return this.tweetsService.findAll();
  }

  @Mutation(() => Tweet)
  createTweet(
    @Args('authorId') authorId: string,
    @Args('content') content: string,
    @Args('hashtags', { type: () => [String], nullable: true })
    hashtags: string[],
    @Args('category', { nullable: true }) category: string,
    @Args('location', { nullable: true }) location: string,
  ) {
    return this.tweetsService.create(
      authorId,
      content,
      hashtags,
      category,
      location,
    );
  }
}
