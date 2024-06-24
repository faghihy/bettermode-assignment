import { Test, TestingModule } from '@nestjs/testing';
import { TweetsService } from './tweets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { TweetPermissions } from './entities/tweet-permissions.entity';
import { CreateTweet } from './types/create-tweet.input';
import { UpdateTweetPermissions } from './types/update-tweet-permissions.input';
import { TweetCategory } from './types/category.enum';

describe('TweetsService', () => {
  let service: TweetsService;
  let tweetsRepository: Repository<Tweet>;
  let tweetPermissionsRepository: Repository<TweetPermissions>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: getRepositoryToken(Tweet),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(TweetPermissions),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
    tweetsRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
    tweetPermissionsRepository = module.get<Repository<TweetPermissions>>(
      getRepositoryToken(TweetPermissions),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTweet', () => {
    it('should create a new tweet', async () => {
      const createTweetInput: CreateTweet = {
        content: 'This is a test tweet',
        authorId: 'user123',
        hashtags: ['test'],
        location: 'test location',
        category: TweetCategory.Tech,
      };

      const savedTweet = {
        id: '1',
        ...createTweetInput,
      };

      jest.spyOn(tweetsRepository, 'create').mockReturnValue(savedTweet as any);
      jest.spyOn(tweetsRepository, 'save').mockResolvedValue(savedTweet as any);

      const result = await service.createTweet(createTweetInput);
      expect(result).toEqual(savedTweet);
    });
  });

  describe('paginateTweets', () => {
    it('should paginate tweets', async () => {
      const userId = 'user123';
      const page = 1;
      const limit = 2;
      const filter = {};

      const tweets = [
        { id: '1', content: 'Tweet 1', authorId: userId },
        { id: '2', content: 'Tweet 2', authorId: userId },
      ];

      jest
        .spyOn(tweetsRepository, 'query')
        .mockResolvedValueOnce(tweets as any);
      jest
        .spyOn(tweetsRepository, 'query')
        .mockResolvedValueOnce([{ count: 3 }] as any);

      const result = await service.paginateTweets(userId, page, limit, filter);
      expect(result).toEqual({
        nodes: tweets,
        hasNextPage: true,
      });
    });
  });

  describe('canEditTweet', () => {
    it('should return true if user can edit the tweet', async () => {
      const userId = 'user123';
      const tweetId = 'tweet123';

      const editableTweets = [{ id: tweetId }];

      jest
        .spyOn(tweetsRepository, 'query')
        .mockResolvedValue(editableTweets as any);

      const result = await service.canEditTweet(userId, tweetId);
      expect(result).toBe(true);
    });

    it('should return false if user cannot edit the tweet', async () => {
      const userId = 'user123';
      const tweetId = 'tweet123';

      jest.spyOn(tweetsRepository, 'query').mockResolvedValue([]);

      const result = await service.canEditTweet(userId, tweetId);
      expect(result).toBe(false);
    });
  });

  describe('updateTweetPermissions', () => {
    it('should update tweet permissions', async () => {
      const updateTweetPermissionsInput: UpdateTweetPermissions = {
        tweetId: 'tweet123',
        inheritViewPermissions: true,
        inheritEditPermissions: true,
        viewPermissions: {
          userIds: ['user1'],
          groupIds: ['group1'],
        },
        editPermissions: {
          userIds: ['user1'],
          groupIds: ['group1'],
        },
      };

      const tweet = {
        id: 'tweet123',
        inheritViewPermission: true,
        inheritEditPermission: true,
        permissions: [],
      };

      jest.spyOn(tweetsRepository, 'findOne').mockResolvedValue(tweet as any);
      jest.spyOn(tweetsRepository, 'save').mockResolvedValue(tweet as any);
      jest.spyOn(tweetPermissionsRepository, 'delete').mockResolvedValue(null);
      jest.spyOn(tweetPermissionsRepository, 'save').mockResolvedValue(null);

      const result = await service.updateTweetPermissions(
        updateTweetPermissionsInput,
      );
      expect(result).toBe(true);
    });

    it('should throw an error if tweet is not found', async () => {
      const updateTweetPermissionsInput: UpdateTweetPermissions = {
        tweetId: 'tweet123',
        inheritViewPermissions: true,
        inheritEditPermissions: true,
        viewPermissions: {
          userIds: ['user1'],
          groupIds: ['group1'],
        },
        editPermissions: {
          userIds: ['user1'],
          groupIds: ['group1'],
        },
      };

      jest.spyOn(tweetsRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateTweetPermissions(updateTweetPermissionsInput),
      ).rejects.toThrow('Tweet not found');
    });
  });
});
