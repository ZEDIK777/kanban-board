import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service'; // <-- Добавили

@ApiTags('Карточки (Cards)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly prisma: PrismaService, // <-- Внедрили Prisma
  ) {}

  @Post('columns/:columnId/cards')
  create(
    @Param('columnId') columnId: string,
    @Body() dto: CreateCardDto,
    @CurrentUser() user: any,
  ) {
    return this.cardsService.create(user.id, columnId, dto);
  }

  @Patch('cards/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto);
  }

  @Patch('cards/:id/move')
  move(@Param('id') id: string, @Body() dto: MoveCardDto) {
    return this.cardsService.move(id, dto);
  }

  @Delete('cards/:id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }

  // --- Новый метод для получения карточек колонки ---
  @Get('columns/:columnId/cards')
  findAllForColumn(@Param('columnId') columnId: string) {
    return this.prisma.card.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
    });
  }
}