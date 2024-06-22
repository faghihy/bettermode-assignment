import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';

@Resolver()
export class GroupsResolver {
  constructor(private groupsService: GroupsService) {}

  @Mutation(() => Group)
  createGroup(
    @Args('name') name: string,
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @Args('groupIds', { type: () => [String], nullable: true })
    groupIds: number[],
  ) {
    return this.groupsService.createGroup(name, userIds, groupIds);
  }
}
