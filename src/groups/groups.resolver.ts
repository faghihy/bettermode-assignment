import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { CreateGroup } from './types/create-group.type';

@Resolver(() => Group)
export class GroupsResolver {
  constructor(private groupsService: GroupsService) {}

  @Mutation(() => Group)
  async createGroup(@Args('input') input: CreateGroup): Promise<Group> {
    return this.groupsService.createGroup(input);
  }
}
