import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';

@Resolver()
export class TweetsResolver {
  constructor(private tweetsService: TweetsResolver) {}

  @Query(() => [Tweet])
  tweets() {}

  @Mutation(() => Tweet)
  createTweet() {}
}
