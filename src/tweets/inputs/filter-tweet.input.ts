import { InputType, Field } from '@nestjs/graphql';
import { TweetCategory } from '../enums/category.enum';

@InputType()
export class FilterTweet {
  @Field({ nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  hashtag?: string;

  @Field({ nullable: true })
  parentTweetId?: string;

  @Field({ nullable: true })
  category?: TweetCategory;

  @Field({ nullable: true })
  location?: string;
}
