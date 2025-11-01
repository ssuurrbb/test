import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Articles } from './article.entity';
import { ArticlesService } from './article.service';
import { ArticlesController } from './article.controller';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Articles])],
  providers: [ArticlesService, RedisService],
  controllers: [ArticlesController],
})
export class ArticlesModule { }
