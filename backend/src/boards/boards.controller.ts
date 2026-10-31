import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'; // <-- Добавили
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';


ApiTags('Доски (Boards)') 
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard) // <-- Защищаем всё
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.boardsService.findAllForUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.boardsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateBoardDto) {
    // В реальном проекте здесь нужно проверить, что юзер — OWNER
    return this.boardsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // В реальном проекте здесь нужно проверить, что юзер — OWNER
    return this.boardsService.remove(id);
  }
}