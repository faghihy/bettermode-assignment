import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';

@Resolver()
export class PermissionsResolver {
  constructor(private permissionsService: PermissionsService) {}

  @Mutation(() => Permission)
  updateTweetPermissions() {}

  @Query(() => Boolean)
  canView() {}

  @Query(() => Boolean)
  canEdit() {}
}
