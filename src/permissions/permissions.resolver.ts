import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { Tweet } from '../tweets/entities/tweet.entity';

@Resolver()
export class PermissionsResolver {
  constructor(private permissionsService: PermissionsService) {}

  @Mutation(() => Permission)
  updateTweetPermissions(
    @Args('tweetId') tweetId: Tweet,
    @Args('inheritViewPermissions') inheritViewPermissions: boolean,
    @Args('inheritEditPermissions') inheritEditPermissions: boolean,
    @Args('viewPermissions', { type: () => [String], nullable: true })
    viewPermissions: string[],
    @Args('editPermissions', { type: () => [String], nullable: true })
    editPermissions: string[],
  ) {
    return this.permissionsService.doPermissions(
      tweetId,
      inheritViewPermissions,
      inheritEditPermissions,
      viewPermissions,
      editPermissions,
    );
  }

  @Query(() => Boolean)
  canView(@Args('userId') userId: string, @Args('tweetId') tweetId: string) {
    return this.permissionsService.canView(userId, tweetId);
  }

  @Query(() => Boolean)
  canEdit(@Args('userId') userId: string, @Args('tweetId') tweetId: string) {
    return this.permissionsService.canEdit(userId, tweetId);
  }
}
