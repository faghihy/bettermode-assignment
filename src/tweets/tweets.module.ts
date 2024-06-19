import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet])],
  providers: [],
})
export class UsersModule {}
