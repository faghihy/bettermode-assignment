import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateTweetPermissions {
  @Field()
  inheritViewPermissions: boolean;

  @Field()
  inheritEditPermissions: boolean;

  @Field()
  viewPermissions: PermissionList;

  @Field()
  editPermissions: PermissionList;
}

@InputType()
class PermissionList {
  @Field()
  userIds: string[];

  @Field()
  groupIds: string[];
}
