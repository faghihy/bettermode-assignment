import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private tweetsRepository: Repository<Tweet>,
    private usersService: UsersService,
  ) {}

  findAll(): Promise<Tweet[]> {
    return this.tweetsRepository.find();
  }

  findOne(id: string): Promise<Tweet> {
    return this.tweetsRepository.findOneBy({ id });
  }

  async create(
    authorId: string,
    content: string,
    hashtags: string[],
    category: string,
    location: string,
  ): Promise<Tweet> {
    const author = await this.usersService.findOne(authorId);
    const tweet = this.tweetsRepository.create({
      author,
      content,
      hashtags,
      category,
      location,
    });
    return this.tweetsRepository.save(tweet);
  }
}
