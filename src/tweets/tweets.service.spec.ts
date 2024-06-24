import { Test, TestingModule } from '@nestjs/testing';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';
import { TweetPermissions } from './entities/tweet-permissions.entity';
import { CreateTweet } from './types/create-tweet.input';
import { FilterTweet } from './types/filter-tweet.input';
import { UpdateTweetPermissions } from './types/update-tweet-permissions.input';

describe('TweetsService', () => {
  let service: TweetsService;
  let tweetsRepository: Repository<Tweet>;
  let tweetPermissionsRepository: Repository<TweetPermissions>;
  let dataSource: DataSource;

  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

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
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
            createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
          },
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
    tweetsRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
    tweetPermissionsRepository = module.get<Repository<TweetPermissions>>(
      getRepositoryToken(TweetPermissions),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canEditTweet', () => {
    it('should return true if user can edit the tweet', async () => {
      const tweetId = '1';
      const userId = '2';
      const queryResult = [{ canEdit: true }];
      jest.spyOn(dataSource, 'query').mockResolvedValue(queryResult);

      const result = await service.canEditTweet(tweetId, userId);

      expect(result).toBe(true);
      expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [
        tweetId,
        userId,
      ]);
    });

    it('should return false if user cannot edit the tweet', async () => {
      const tweetId = '1';
      const userId = '2';
      const queryResult = [{ canEdit: false }];
      jest.spyOn(dataSource, 'query').mockResolvedValue(queryResult);

      const result = await service.canEditTweet(tweetId, userId);

      expect(result).toBe(false);
      expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [
        tweetId,
        userId,
      ]);
    });
  });

  describe('paginateTweets', () => {
    it('should return paginated tweets', async () => {
      const userId = '1';
      const page = 1;
      const limit = 10;
      const filter: FilterTweet = {};
      const tweets = [{ id: '1' }, { id: '2' }];
      const count = [{ count: 2 }];
      jest
        .spyOn(dataSource, 'query')
        .mockResolvedValueOnce(tweets)
        .mockResolvedValueOnce(count);

      const result = await service.paginateTweets(userId, page, limit, filter);

      expect(result).toEqual({
        nodes: tweets,
        hasNextPage: false,
      });
      expect(dataSource.query).toHaveBeenCalledTimes(2);
      expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [
        userId,
        userId,
        limit,
        expect.any(Number),
      ]);
    });
  });

  describe('createTweet', () => {
    it('should create and return a new tweet', async () => {
      const createTweetInput: CreateTweet = {
        content: 'New tweet',
        authorId: '1',
        hashtags: [],
      };
      const newTweet: Tweet = { id: '1', ...createTweetInput } as Tweet;
      jest.spyOn(tweetsRepository, 'create').mockReturnValue(newTweet);
      jest.spyOn(tweetsRepository, 'save').mockResolvedValue(newTweet);

      const result = await service.createTweet(createTweetInput);

      expect(result).toEqual(newTweet);
      expect(tweetsRepository.create).toHaveBeenCalledWith(createTweetInput);
      expect(tweetsRepository.save).toHaveBeenCalledWith(newTweet);
    });
  });

  describe('updateTweetPermissions', () => {
    it('should update tweet permissions and return true', async () => {
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
      const tweet: Tweet = { id: '1', permissions: [] } as Tweet;
      jest.spyOn(tweetsRepository, 'findOne').mockResolvedValue(tweet);
      jest
        .spyOn(tweetPermissionsRepository, 'delete')
        .mockResolvedValue(undefined);
      jest.spyOn(tweetPermissionsRepository, 'save').mockResolvedValue([]);
      jest.spyOn(tweetsRepository, 'save').mockResolvedValue(tweet);

      const result = await service.updateTweetPermissions(input);

      expect(result).toBe(true);
      expect(tweetsRepository.findOne).toHaveBeenCalledWith({
        where: { id: input.tweetId },
        relations: ['permissions'],
      });
      expect(tweetPermissionsRepository.delete).toHaveBeenCalledWith({ tweet });
      expect(tweetPermissionsRepository.save).toHaveBeenCalledWith([
        {
          tweet,
          userId: '2',
          canView: true,
          canEdit: false,
        } as TweetPermissions,
        {
          tweet,
          userId: '3',
          canView: true,
          canEdit: false,
        } as TweetPermissions,
        {
          tweet,
          userId: '4',
          canView: true,
          canEdit: true,
        } as TweetPermissions,
      ]);
      expect(tweetsRepository.save).toHaveBeenCalledWith(tweet);
      expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('should throw an error if tweet not found', async () => {
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
      jest.spyOn(tweetsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateTweetPermissions(input)).rejects.toThrow(
        'Tweet not found',
      );
      expect(tweetsRepository.findOne).toHaveBeenCalledWith({
        where: { id: input.tweetId },
        relations: ['permissions'],
      });
      expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunnerMock.release).toHaveBeenCalled();
    });
  });
});
