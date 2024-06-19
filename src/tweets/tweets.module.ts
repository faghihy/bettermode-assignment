import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { UsersModule } from 'src/users/users.module';
import { TweetsService } from './tweets.service';
import { TweetsResolver } from './tweets.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet]), UsersModule],
  providers: [TweetsService, TweetsResolver],
})
export class TweetsModule {}