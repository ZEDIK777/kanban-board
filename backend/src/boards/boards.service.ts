import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Доски')
@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Создаем доску
      const board = await tx.board.create({
        data: {
          title: dto.title,
          ownerId: userId,
        },
      });

      // 2. Добавляем владельца в участники
      await tx.boardMember.create({
        data: {
          boardId: board.id,
          userId: userId,
          role: 'OWNER',
        },
      });

      // 3. Создаем дефолтные колонки
      await tx.boardColumn.createMany({
        data: [
          { boardId: board.id, title: 'To Do', position: 0 },
          { boardId: board.id, title: 'In Progress', position: 1 },
          { boardId: board.id, title: 'Done', position: 2 },
        ],
      });

      return board;
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        members: {
          some: { userId }, // Ищем доски, где этот юзер есть в участниках
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: {
        id,
        members: { some: { userId } }, // Проверяем доступ
      },
    });
    if (!board) throw new NotFoundException('Доска не найдена или нет доступа');
    return board;
  }

  async update(id: string, dto: CreateBoardDto) {
    return this.prisma.board.update({
      where: { id },
      data: { title: dto.title },
    });
  }

  async remove(id: string) {
    // Благодаря onDelete: Cascade в схеме, все колонки и карточки удалятся автоматически
    return this.prisma.board.delete({
      where: { id },
    });
  }
}