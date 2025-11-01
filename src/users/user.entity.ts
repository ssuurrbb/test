import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Articles } from '../articles/article.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Articles, (article) => article.author)
  articles: Articles[];
}
