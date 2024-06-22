import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { TweetPermissions } from './entities/tweet-permissions.entity';
import { UsersModule } from 'src/users/users.module';
import { TweetsService } from './tweets.service';
import { TweetsResolver } from './tweets.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet, TweetPermissions]), UsersModule],
  providers: [TweetsService, TweetsResolver],
})
export class TweetsModule {}
