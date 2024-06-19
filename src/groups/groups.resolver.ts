import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';

@Resolver()
export class GroupsResolver {
  constructor(private groupsService: GroupsService) {}

  @Query(() => [Group])
  groups() {
    return this.groupsService.findAll();
  }

  @Query(() => Group)
  group(@Args('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Mutation(() => Group)
  createGroup(
    @Args('name') name: string,
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @Args('groupIds', { type: () => [String], nullable: true })
    groupIds: string[],
  ) {
    return this.groupsService.create(name, userIds, groupIds);
  }

  @Query(() => [Group])
  groupMembers(@Args('groupId') groupIds: string) {
    return this.groupsService;
  }
}
