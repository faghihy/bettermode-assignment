import { Test, TestingModule } from '@nestjs/testing';
import { TweetsResolver } from './tweets.resolver';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';
import { CreateTweet } from './types/create-tweet.input';
import { FilterTweet } from './types/filter-tweet.input';
import { PaginatedTweet } from './types/paginated-tweet.type';
import { UpdateTweetPermissions } from './types/update-tweet-permissions.input';

describe('TweetsResolver', () => {
  let resolver: TweetsResolver;
  let service: TweetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsResolver,
        {
          provide: TweetsService,
          useValue: {
            paginateTweets: jest.fn(),
            canEditTweet: jest.fn(),
            createTweet: jest.fn(),
            updateTweetPermissions: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<TweetsResolver>(TweetsResolver);
    service = module.get<TweetsService>(TweetsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('paginateTweets', () => {
    it('should call TweetsService.paginateTweets and return paginated tweets', async () => {
      const userId = '1';
      const limit = 10;
      const page = 1;
      const filter: FilterTweet = {};
      const paginatedTweets: PaginatedTweet = {
        nodes: [{ id: '1' } as Tweet, { id: '2' } as Tweet],
        hasNextPage: false,
      };

      jest.spyOn(service, 'paginateTweets').mockResolvedValue(paginatedTweets);

      const result = await resolver.paginateTweets(userId, limit, page, filter);

      expect(result).toEqual(paginatedTweets);
      expect(service.paginateTweets).toHaveBeenCalledWith(
        userId,
        page,
        limit,
        filter,
      );
    });
  });

  describe('canEditTweet', () => {
    it('should call TweetsService.canEditTweet and return true', async () => {
      const userId = '1';
      const tweetId = '2';
      const canEdit = true;

      jest.spyOn(service, 'canEditTweet').mockResolvedValue(canEdit);

      const result = await resolver.canEditTweet(userId, tweetId);

      expect(result).toBe(canEdit);
      expect(service.canEditTweet).toHaveBeenCalledWith(userId, tweetId);
    });

    it('should call TweetsService.canEditTweet and return false', async () => {
      const userId = '1';
      const tweetId = '2';
      const canEdit = false;

      jest.spyOn(service, 'canEditTweet').mockResolvedValue(canEdit);

      const result = await resolver.canEditTweet(userId, tweetId);

      expect(result).toBe(canEdit);
      expect(service.canEditTweet).toHaveBeenCalledWith(userId, tweetId);
    });
  });

  describe('createTweet', () => {
    it('should call TweetsService.createTweet and return the new tweet', async () => {
      const createTweetInput: CreateTweet = {
        content: 'New tweet',
        authorId: '1',
        hashtags: [],
      };
      const newTweet: Tweet = { id: '1', ...createTweetInput } as Tweet;

      jest.spyOn(service, 'createTweet').mockResolvedValue(newTweet);

      const result = await resolver.createTweet(createTweetInput);

      expect(result).toEqual(newTweet);
      expect(service.createTweet).toHaveBeenCalledWith(createTweetInput);
    });
  });

  describe('updateTweetPermissions', () => {
    it('should call TweetsService.updateTweetPermissions and return true', async () => {
      const input: UpdateTweetPermissions = {
        tweetId: '1',
        inheritViewPermissions: true,
        inheritEditPermissions: true,
        viewPermissions: {
          userIds: ['2', '3'],
          groupIds: [],
        },
        editPermissions: {
          userIds: ['4'],
          groupIds: [],
        },
      };
      const updated = true;

      jest.spyOn(service, 'updateTweetPermissions').mockResolvedValue(updated);

      const result = await resolver.updateTweetPermissions(input);

      expect(result).toBe(updated);
      expect(service.updateTweetPermissions).toHaveBeenCalledWith(input);
    });

    it('should call TweetsService.updateTweetPermissions and return false', async () => {
      const input: UpdateTweetPermissions = {
        tweetId: '1',
        inheritViewPermissions: true,
        inheritEditPermissions: true,
        viewPermissions: {
          userIds: ['2', '3'],
          groupIds: [],
        },
        editPermissions: {
          userIds: ['4'],
          groupIds: [],
        },
      };
      const updated = false;

      jest.spyOn(service, 'updateTweetPermissions').mockResolvedValue(updated);

      const result = await resolver.updateTweetPermissions(input);

      expect(result).toBe(updated);
      expect(service.updateTweetPermissions).toHaveBeenCalledWith(input);
    });
  });
});
