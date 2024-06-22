import { ObjectType, Field } from '@nestjs/graphql';
import { Tweet } from '../entities/tweet.entity';

@ObjectType()
export class PaginatedTweet {
  @Field(() => [Tweet])
  nodes: Tweet[];

  @Field()
  hasNextPage: boolean;
}
