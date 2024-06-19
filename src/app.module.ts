import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

import { Group } from './groups/entities/group.entity';
import { GroupsModule } from './groups/groups.module';

import { Tweet } from './tweets/entities/tweet.entity';
import { TweetsModule } from './tweets/tweets.module';

import { Permission } from './permissions/entities/permission.entity';
import { PermissionModule } from './permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: 'twperm', // TODO: process.env.DATABASE_NAME
      entities: [User, Group, Tweet, Permission],
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    UsersModule,
    GroupsModule,
    TweetsModule,
    PermissionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
