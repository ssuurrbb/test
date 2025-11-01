import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Articles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.articles, { eager: true })
  author: User;
}
