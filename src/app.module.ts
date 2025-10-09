import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './modules/users/user.entity';
import { FileEntity } from './modules/files/file.entity';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { FilesModule } from './modules/files/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, FileEntity],
      synchronize: true, // ⚠️ в продакшене ставим false
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    ChatModule,
    FilesModule,
  ],
})
export class AppModule {}
