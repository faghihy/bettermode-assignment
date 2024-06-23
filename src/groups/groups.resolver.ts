import { Resolver, Mutation } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { CreateGroup } from './types/create-group.type';

@Resolver()
export class GroupsResolver {
  constructor(private groupsService: GroupsService) {}

  @Mutation(() => Group)
  async createGroup(args: CreateGroup): Promise<Group> {
    return this.groupsService.createGroup(
      args.name,
      args.userIds,
      args.groupIds,
    );
  }
}
