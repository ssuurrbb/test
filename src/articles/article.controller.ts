import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticlesService } from './article.service';
import { CreateArticleDto } from './dto/create.article.dto';
import { UpdateArticleDto } from './dto/update.article.dto';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articleService: ArticlesService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() dto: CreateArticleDto, @Request() req) {
        return this.articleService.create(dto, req.user);
    }

    @Get()
    findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('authorId') authorId: number, @Query('date') date: string) {
        return this.articleService.findAll(page, limit, authorId, date);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.articleService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateArticleDto, @Request() req) {
        return this.articleService.update(+id, dto, req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: number, @Request() req) {
        return this.articleService.remove(+id, req.user);
    }
}
