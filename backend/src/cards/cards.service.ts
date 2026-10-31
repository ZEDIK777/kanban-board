import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, columnId: string, dto: CreateCardDto) {
    // 1. Находим колонку, чтобы узнать boardId
    const column = await this.prisma.boardColumn.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundException('Колонка не найдена');

    // 2. Проверяем, что исполнитель (если указан) есть в участниках доски
    if (dto.assigneeId) {
      const isMember = await this.prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId: column.boardId, userId: dto.assigneeId } },
      });
      if (!isMember) throw new BadRequestException('Исполнитель не является участником доски');
    }

    // 3. Вычисляем позицию (в конец колонки)
    const lastCard = await this.prisma.card.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' },
    });
    const position = lastCard ? lastCard.position + 1 : 0;

    return this.prisma.card.create({
      data: {
        boardId: column.boardId,
        columnId,
        createdById: userId,
        title: dto.title,
        description: dto.description,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        position,
      },
    });
  }

  async update(id: string, dto: UpdateCardDto) {
    // Проверка: если меняем исполнителя, он должен быть участником доски
    if (dto.assigneeId) {
      const card = await this.prisma.card.findUnique({ where: { id } });
      if (!card) throw new NotFoundException('Карточка не найдена');

      const isMember = await this.prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId: card.boardId, userId: dto.assigneeId } },
      });
      if (!isMember) throw new BadRequestException('Исполнитель не является участником доски');
    }

    return this.prisma.card.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async move(id: string, dto: MoveCardDto) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Карточка не найдена');

    // Простейшая реализация: просто меняем колонку и позицию
    return this.prisma.card.update({
      where: { id },
      data: {
        columnId: dto.columnId,
        position: dto.position,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.card.delete({ where: { id } });
  }
}