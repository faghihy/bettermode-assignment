import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

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
      database: '5', // TODO: process.env.DATABASE_NAME
      entities: [User, Group, GroupMembers, Tweet, TweetPermissions],
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    UsersModule,
    GroupsModule,
    TweetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
