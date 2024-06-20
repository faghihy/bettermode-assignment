import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Tweet } from 'src/tweets/entities/tweet.entity';
import { GroupsService } from 'src/groups/groups.service';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private groupsService: GroupsService,
  ) {}

  async getPermissions(tweetId: string): Promise<Permission> {
    return this.permissionsRepository.findOne({
      where: { tweet: { id: tweetId } },
      relations: ['tweet'],
    });
  }

  async doPermissions(
    tweet: Tweet,
    inheritViewPermissions: boolean,
    inheritEditPermissions: boolean,
    viewPermissions: string[],
    editPermissions: string[],
  ): Promise<Permission> {
    let permissions = await this.getPermissions(tweet.id);

    if (!permissions) {
      permissions = this.permissionsRepository.create({ tweet });
    }

    permissions.inheritViewPermissions = inheritViewPermissions;
    permissions.inheritEditPermissions = inheritEditPermissions;
    permissions.viewPermissions = viewPermissions;
    permissions.editPermissions = editPermissions;

    return this.permissionsRepository.save(permissions);
  }

  async canView(userId: string, tweetId: string): Promise<boolean> {
    const tweet = await this.permissionsRepository.findOne({
      where: { tweet: { id: tweetId } },
      relations: ['tweet'],
    });

    if (tweet.inheritViewPermissions && tweet.tweet.parentTweetId) {
      return this.canView(userId, tweet.tweet.parentTweetId);
    }

    if (tweet.viewPermissions.includes(userId)) {
      return true;
    }

    for (const groupId of tweet.viewPermissions) {
      const groupMembers = await this.groupsService.getAllMembers(groupId);
      if (groupMembers.some((member) => member.id === userId)) {
        return true;
      }
    }
    return false;
  }
  async canEdit(userId: string, tweetId: string): Promise<boolean> {
    const tweet = await this.permissionsRepository.findOne({
      where: { tweet: { id: tweetId } },
      relations: ['tweet'],
    });

    if (tweet.inheritEditPermissions && tweet.tweet.parentTweetId) {
      return this.canEditTweet(userId, tweet.tweet.parentTweetId);
    }

    if (tweet.editPermissions.includes(userId)) {
      return true;
    }

    for (const groupId of tweet.editPermissions) {
      const groupMembers = await this.groupsService.getAllMembers(groupId);
      if (groupMembers.some((member) => member.id === userId)) {
        return true;
      }
    }

    return false;
  }
}
