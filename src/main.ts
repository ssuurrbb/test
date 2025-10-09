import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const uploadDir = join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

  app.use('/uploads', express.static(uploadDir));

  await app.listen(3000);
  console.log(`Server running on http://localhost:3000`);
}
bootstrap();
