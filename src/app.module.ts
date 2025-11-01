import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/user.entity';
import { FileEntity } from './files/file.entity';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/file.module';
import { ArticlesModule } from './articles/article.module';
import { Articles } from './articles/article.entity';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, FileEntity, Articles],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    ChatModule,
    FilesModule,
    ArticlesModule,
  ],
  providers: [RedisService],
})
export class AppModule {}
