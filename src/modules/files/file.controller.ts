import { Controller, Post, UseInterceptors, UploadedFile, Get, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './file.service';
import { join } from 'path';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname),
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filePath = join('uploads', file.filename);
    return this.filesService.create(file.filename, filePath);
  }

  @Get()
  getAll() {
    return this.filesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.filesService.remove(id);
  }
}
