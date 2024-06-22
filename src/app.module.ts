import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

import { Group } from './groups/entities/group.entity';
import { GroupsModule } from './groups/groups.module';
import { GroupMembers } from './groups/entities/group-members.entity';

import { Tweet } from './tweets/entities/tweet.entity';
import { TweetsModule } from './tweets/tweets.module';
import { TweetPermissions } from './tweets/entities/tweet-permissions.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: 'twperm4', // TODO: process.env.DATABASE_NAME
      entities: [User, Group, GroupMembers, Tweet, TweetPermissions],
      synchronize: true,
    }),
    UsersModule,
    GroupsModule,
    TweetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
