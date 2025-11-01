import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articles } from './article.entity';
import { CreateArticleDto } from './dto/create.article.dto';
import { UpdateArticleDto } from './dto/update.article.dto';
import { User } from '../users/user.entity';
import { RedisService } from './../redis/redis.service';

@Injectable()
export class ArticlesService {
  private redisClient;
  constructor(
    @InjectRepository(Articles)
    private readonly articleRepo: Repository<Articles>,
    private redisService: RedisService,
  ) {
    this.redisClient = this.redisService.getClient();
  }

  // Создание статьи с инвалидацией кэша
  async create(dto: CreateArticleDto, author: User): Promise<Articles> {
    const article = this.articleRepo.create({ ...dto, author });
    const saved = await this.articleRepo.save(article);

    // Инвалидация кэша
    await this.redisClient.flushall();

    return saved;
  }

  // Получение списка статей с кэшем, пагинацией и фильтрами
  async findAll(
    page = 1,
    limit = 10,
    authorId?: number,
    date?: string,
  ): Promise<{ data: Articles[]; total: number }> {
    const key = `articles_page_${page}_limit_${limit}_author_${authorId || 'all'}_date_${date || 'all'}`;
    const cached = await this.redisClient.get(key);
    if (cached) { console.log('From Redis'); return JSON.parse(cached); }


    const query = this.articleRepo.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    if (authorId) query.andWhere('author.id = :authorId', { authorId });
    if (date) query.andWhere('DATE(article.publishedAt) = :date', { date });

    const total = await query.getCount();

    const data = await query
      .orderBy('article.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Сохраняем в Redis на 60 секунд
    await this.redisClient.set(key, JSON.stringify({ data, total }), 'EX', 60);

    return { data, total };
  }

  // Получение одной статьи
  async findOne(id: number): Promise<Articles> {
    const article = await this.articleRepo.findOne({ where: { id }, relations: ['author'] });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  // Обновление статьи с инвалидацией кэша
  async update(id: number, dto: UpdateArticleDto, user: User): Promise<Articles> {
    const article = await this.findOne(id);
    if (article.author.id !== user.id) {
      throw new ForbiddenException('You can update only your own articles');
    }

    Object.assign(article, dto);
    const updated = await this.articleRepo.save(article);

    // Инвалидация кэша
    await this.redisClient.flushall();

    return updated;
  }

  // Удаление статьи с инвалидацией кэша
  async remove(id: number, user: User): Promise<void> {
    const article = await this.findOne(id);
    if (article.author.id !== user.id) {
      throw new ForbiddenException('You can delete only your own articles');
    }

    await this.articleRepo.remove(article);

    // Инвалидация кэша
    await this.redisClient.flushall();
  }
}
