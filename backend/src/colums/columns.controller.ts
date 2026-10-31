import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Колонки (Columns)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post('boards/:boardId/columns')
  create(@Param('boardId') boardId: string, @Body() dto: CreateColumnDto) {
    return this.columnsService.create(boardId, dto);
  }

  @Get('boards/:boardId/columns')
  findAll(@Param('boardId') boardId: string) {
    return this.columnsService.findAllForBoard(boardId);
  }

  @Patch('columns/:id')
  update(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.update(id, dto);
  }

  @Delete('columns/:id')
  remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }
}