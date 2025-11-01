import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './article.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Articles } from './article.entity';
import { Repository } from 'typeorm';
import { RedisService } from './../redis/redis.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/user.entity';

describe('ArticlesService', () => {
    let service: ArticlesService;
    let repo: Repository<Articles>;
    let redisClient;

    const mockRepo = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        createQueryBuilder: jest.fn(),
        remove: jest.fn(),
    };

    const mockRedis = {
        getClient: jest.fn().mockReturnValue({
            get: jest.fn(),
            set: jest.fn(),
            flushall: jest.fn(),
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesService,
                { provide: getRepositoryToken(Articles), useValue: mockRepo },
                { provide: RedisService, useValue: mockRedis },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);
        repo = module.get<Repository<Articles>>(getRepositoryToken(Articles));
        redisClient = mockRedis.getClient();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockUser: User = { id: 1, email: 'test@mail.com', password: '123', articles: [] };

    it('сервис должен быть определён', () => {
        expect(service).toBeDefined();
    });

    it('create() должен сохранять статью и очищать кэш', async () => {
        const dto = { title: 'Test', description: 'Desc' };
        const article = { id: 1, ...dto, author: mockUser };

        mockRepo.create.mockReturnValue(article);
        mockRepo.save.mockResolvedValue(article);

        const result = await service.create(dto as any, mockUser);

        expect(mockRepo.create).toHaveBeenCalledWith({ ...dto, author: mockUser });
        expect(mockRepo.save).toHaveBeenCalledWith(article);
        expect(redisClient.flushall).toHaveBeenCalled();
        expect(result).toEqual(article);
    });

    it('findOne() должен вернуть статью', async () => {
        const article = { id: 1, title: 'Test', author: mockUser };
        mockRepo.findOne.mockResolvedValue(article);

        const result = await service.findOne(1);
        expect(result).toEqual(article);
    });

    it('findOne() должен выбросить ошибку, если статья не найдена', async () => {
        mockRepo.findOne.mockResolvedValue(null);
        await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('update() должен обновлять статью, если пользователь — автор', async () => {
        const article = { id: 1, title: 'Old', author: mockUser };
        mockRepo.findOne.mockResolvedValue(article);
        mockRepo.save.mockResolvedValue({ ...article, title: 'Updated' });

        const dto = { title: 'Updated' };
        const result = await service.update(1, dto as any, mockUser);

        expect(mockRepo.save).toHaveBeenCalledWith({ ...article, title: 'Updated' });
        expect(redisClient.flushall).toHaveBeenCalled();
        expect(result.title).toBe('Updated');
    });

    it('update() должен выбросить ошибку, если пользователь не автор', async () => {
        const article = { id: 1, title: 'Old', author: { id: 2 } };
        mockRepo.findOne.mockResolvedValue(article);
        await expect(service.update(1, { title: 'x' } as any, mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('remove() должен удалить статью, если пользователь автор', async () => {
        const article = { id: 1, author: mockUser };
        mockRepo.findOne.mockResolvedValue(article);
        await service.remove(1, mockUser);
        expect(mockRepo.remove).toHaveBeenCalledWith(article);
        expect(redisClient.flushall).toHaveBeenCalled();
    });

    it('remove() должен выбросить ошибку, если пользователь не автор', async () => {
        const article = { id: 1, author: { id: 2 } };
        mockRepo.findOne.mockResolvedValue(article);
        await expect(service.remove(1, mockUser)).rejects.toThrow(ForbiddenException);
    });
});
