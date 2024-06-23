import { InputType, Field } from '@nestjs/graphql';
import { TweetCategory } from './category.enum';

@InputType()
export class CreateTweet {
  @Field()
  authorId: string;

  @Field()
  content: string;

  @Field(() => [String])
  hashtags: string[];

  @Field({ nullable: true })
  parentTweetId?: string;

  @Field({ nullable: true })
  category?: TweetCategory;

  @Field({ nullable: true })
  location?: string;
}
