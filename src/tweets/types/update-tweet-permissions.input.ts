import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class PermissionList {
  @Field(() => [String])
  userIds: string[];

  @Field(() => [String])
  groupIds: string[];
}

@InputType()
export class UpdateTweetPermissions {
  @Field()
  tweetId: string;

  @Field()
  inheritViewPermissions: boolean;

  @Field()
  inheritEditPermissions: boolean;

  @Field()
  viewPermissions: PermissionList;

  @Field()
  editPermissions: PermissionList;
}
