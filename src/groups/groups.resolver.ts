import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';

@Resolver()
export class GroupsResolver {
  constructor(private groupsService: GroupsResolver) {}

  @Query(() => [Group])
  groups() {}

  @Query(() => Group)
  group() {}

  @Mutation(() => Group)
  createUser() {}

  @Query(() => [Group])
  groupMembers() {}
}
