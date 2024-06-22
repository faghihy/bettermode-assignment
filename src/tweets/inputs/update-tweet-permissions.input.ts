import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateTweetPermissions {
  @Field()
  inheritViewPermissions: boolean;

  @Field()
  inheritEditPermissions: boolean;

  @Field(() => [String], { nullable: 'itemsAndList' })
  viewPermissions: string[];

  @Field(() => [String], { nullable: 'itemsAndList' })
  editPermissions: string[];
}
