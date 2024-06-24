import {
  Resolver,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { CreateGroup } from './types/create-group.type';
import { GroupMembers } from './entities/group-members.entity';

@Resolver(() => Group)
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @Mutation(() => Group)
  async createGroup(@Args('input') input: CreateGroup): Promise<Group> {
    return this.groupsService.createGroup(input);
  }

  @ResolveField(() => [GroupMembers])
  async members(@Parent() group: Group): Promise<GroupMembers[]> {
    return this.groupsService.findMembersByGroupId(group.id);
  }
}
