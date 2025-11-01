import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';

@Injectable()
export class FilesService {
  constructor(@InjectRepository(FileEntity) private repo: Repository<FileEntity>) { }

  create(filename: string, path: string) {
    const file = this.repo.create({ filename, path });
    return this.repo.save(file);
  }

  findAll() {
    return this.repo.find();
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
