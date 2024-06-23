import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupMembers } from './entities/group-members.entity';
import { GroupsService } from './groups.service';
import { GroupsResolver } from './groups.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMembers])],
  providers: [GroupsService, GroupsResolver],
})
export class GroupsModule {}
