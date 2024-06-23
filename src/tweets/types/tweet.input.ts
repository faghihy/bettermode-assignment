import { InputType, Field } from '@nestjs/graphql';
import { TweetCategory } from '../types/category.enum';

@InputType()
export class Tweet {
  @Field()
  authorId: string;

  @Field()
  content: string;

  @Field()
  hashtags: string[];

  @Field({ nullable: true })
  parentTweetId?: string;

  @Field({ nullable: true })
  category?: TweetCategory;

  @Field({ nullable: true })
  location?: string;
}
