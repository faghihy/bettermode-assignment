import { InputType, Field, ID } from '@nestjs/graphql';
import { TweetCategory } from '../enums/category.enum';

@InputType()
export class Tweet {
  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  authorId?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  hashtags?: string[];

  @Field({ nullable: true })
  parentTweetId?: string;

  @Field({ nullable: true })
  category?: TweetCategory;

  @Field({ nullable: true })
  location?: string;
}
